"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEscalate } from "@/lib/hooks/useEscalate";
import MusicModal from "@/components/MusicModal";
import DoctorConnectionModal from "@/components/DoctorConnectionModal";
import { Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";

import { io } from "socket.io-client";

export default function ChatBot({ onSessionSave }) {
  const { data: session } = useSession();
  const { escalate, loading: escalating, doctor, error } = useEscalate();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm here for you. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [musicName, setMusicName] = useState("");
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);

  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'hi', name: 'हिंदी', voice: 'hi-IN' },
    { code: 'es', name: 'Español', voice: 'es-ES' }
  ];

  const saveChatSession = async (messages) => {
    if (!session?.user?.id || messages.length < 2) return;
    
    try {
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: new Date()
          }))
        })
      });
      
      if (onSessionSave) {
        onSessionSave();
      }
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        setRecognition(recognitionInstance);
      }
      setSynthesis(window.speechSynthesis);
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Poll for escalation request status
  useEffect(() => {
    if (!isPolling || !currentRequestId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/escalate/status/${currentRequestId}`);
        const data = await response.json();
        
        if (data.status === "accepted") {
          setDoctorInfo({
            requestId: currentRequestId,
            doctorId: data.doctorId,
            doctorName: data.doctorName
          });
          setShowMusicModal(false); // Close music modal
          setShowDoctorModal(true);
          setIsPolling(false);
          clearInterval(pollInterval);
        } else if (data.status === "rejected") {
          let rejectedMessage = "The doctor is currently unavailable. I'm here to continue supporting you. Let's keep talking - what would help you feel better right now?";
          
          if (selectedLang !== 'en') {
            rejectedMessage = await translateText(rejectedMessage, selectedLang);
          }
          
          setMessages(prev => [...prev, {
            role: "assistant",
            content: rejectedMessage
          }]);
          speakText(rejectedMessage);
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, currentRequestId]);

  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io();
      setSocket(newSocket);

      // Register user with their ID for other socket features
      newSocket.emit("register-user", { userId: session.user.id });

      // Listen for doctor acceptance
      newSocket.on("doctor-accepted", (data) => {
        console.log('📨 Received doctor-accepted:', data);
        setDoctorInfo({
          requestId: data.requestId,
          doctorId: data.doctorId,
          doctorName: data.doctorName
        });
        setShowMusicModal(false); // Close music modal
        setShowDoctorModal(true);
        setIsPolling(false);
      });

      // Fallback listener for broadcast events
      newSocket.on("doctor-accepted-broadcast", (data) => {
        console.log('📨 Received doctor-accepted-broadcast:', data);
        console.log('📨 Session user ID:', session.user.id);
        console.log('📨 Target user ID:', data.targetUserId);
        console.log('📨 Target Google ID:', data.targetGoogleId);
        
        if (data.targetUserId === session.user.id || data.targetGoogleId === session.user.id) {
          console.log('🎉 Match found! Showing doctor modal');
          setDoctorInfo({
            requestId: data.requestId,
            doctorId: data.doctorId,
            doctorName: data.doctorName
          });
          setShowMusicModal(false); // Close music modal
          setShowDoctorModal(true);
          setIsPolling(false);
        }
      });

      // Listen for connection acceptance
      newSocket.on("connection-accepted", ({ roomId, connectionType }) => {
        // Redirect patient to room
        window.location.href = `/${connectionType}-room/${roomId}`;
      });

      // Listen for no doctors available
      newSocket.on("no-doctors-available", async ({ message }) => {
        let translatedMessage = `⚠️ ${message}\n\nDon't worry, I'm still here with you. Let's continue talking - I want to help you through this. What's on your mind right now?`;
        
        if (selectedLang !== 'en') {
          translatedMessage = await translateText(translatedMessage, selectedLang);
        }
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: translatedMessage
        }]);
        speakText(translatedMessage);
      });

      return () => {
        newSocket.disconnect();
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [session?.user?.id]);

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const speakText = (text) => {
    if (!synthesis || isSpeaking || isMusicPlaying) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = languages.find(l => l.code === selectedLang);
    utterance.lang = lang?.voice || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesis.speak(utterance);
  };

  const handleMusicPlay = () => {
    setIsMusicPlaying(true);
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMusicStop = () => {
    setIsMusicPlaying(false);
  };

  const startListening = () => {
    if (!recognition) return;
    
    const lang = languages.find(l => l.code === selectedLang);
    recognition.lang = lang?.voice || 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      let finalText = transcript;
      
      if (selectedLang !== 'en') {
        finalText = await translateText(transcript, 'en');
      }
      
      setInput(finalText);
    };
    
    recognition.start();
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let userMessage = input;
    let displayMessage = input;
    
    // If user selected non-English language, translate their English input to selected language for display
    if (selectedLang !== 'en') {
      displayMessage = await translateText(input, selectedLang);
    }

    const newMessages = [...messages, { role: "user", content: displayMessage }];
    setMessages(newMessages);
    setInput("");

    // Always send original English text to AI for processing
    const res = await fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
    });

    const data = await res.json();
    let aiReply = data.reply;
    
    if (selectedLang !== 'en') {
      aiReply = await translateText(data.reply, selectedLang);
    }
    
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: aiReply },
    ]);

    speakText(aiReply);

    if (data.moodMusic) {
      setMusicUrl(data.moodMusic.url);
      setMusicName(data.moodMusic.name);
      setShowMusicModal(true);
    }

    if (data.escalate === true && session?.user?.email) {
      let suicidalContent = "🚨 I've detected you might need immediate help. I'm connecting you with a doctor right now. Please hold on...";
      if (selectedLang !== 'en') {
        suicidalContent = await translateText(suicidalContent, selectedLang);
      }
      
      const suicidalMessage = { 
        role: "assistant", 
        content: suicidalContent,
        isSuicidalDetection: true
      };
      setMessages(prev => [...prev, suicidalMessage]);
      speakText(suicidalContent);
      
      const result = await escalate(session.user.email);
      if (result?.requestId) {
        setCurrentRequestId(result.requestId);
        setIsPolling(true);
      } else {
        let fallbackContent = "I understand you're going through a difficult time right now. While no doctors are available at the moment, I'm here to support you. Let's talk through what you're feeling. Can you tell me more about what's troubling you?";
        if (selectedLang !== 'en') {
          fallbackContent = await translateText(fallbackContent, selectedLang);
        }
        
        const fallbackMessage = {
          role: "assistant",
          content: fallbackContent
        };
        setMessages(prev => [...prev, fallbackMessage]);
        speakText(fallbackContent);
      }
      
      await saveChatSession([...messages, { role: "user", content: userMessage }, suicidalMessage]);
    } else {
      await saveChatSession([...messages, { role: "user", content: userMessage }, { role: "assistant", content: data.reply }]);
    }
  };



  return (
    <div className="border border-emerald-200 rounded-xl p-4 bg-white shadow w-full max-w-2xl mx-auto">
      <div className="h-96 overflow-y-auto mb-4 p-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 whitespace-pre-wrap ${
              msg.role === "assistant"
                ? "text-emerald-800 bg-emerald-50 p-2 rounded"
                : "text-emerald-600 text-right"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <select 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)}
            className="border border-emerald-200 rounded px-2 py-1 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            className={`p-2 rounded ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border border-emerald-200 rounded px-3 py-2"
            placeholder={selectedLang === 'hi' ? 'अपनी भावनाएं लिखें...' : selectedLang === 'es' ? 'Escribe tus sentimientos...' : 'Type your feelings...'}
          />
          <button
            onClick={isListening ? () => recognition?.stop() : startListening}
            disabled={!recognition}
            className={`p-2 rounded ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'} disabled:opacity-50`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSend}
            disabled={escalating}
            className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {escalating ? "Escalating..." : "Send"}
          </button>
        </div>
      </div>



      <MusicModal
        open={showMusicModal}
        onClose={() => {
          setShowMusicModal(false);
          setIsMusicPlaying(false);
        }}
        url={musicUrl}
        name={musicName}
        onPlay={handleMusicPlay}
        onPause={handleMusicStop}
        onEnded={handleMusicStop}
      />

      <DoctorConnectionModal
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        doctorName={doctorInfo?.doctorName}
        requestId={doctorInfo?.requestId}
      />


    </div>
  );
}