"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEscalate } from "@/lib/hooks/useEscalate";
import MusicModal from "@/components/MusicModal";
import DoctorConnectionModal from "@/components/DoctorConnectionModal";

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

  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const messagesEndRef = useRef(null);

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
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "The doctor is currently unavailable. We're finding another doctor for you..."
          }]);
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
      newSocket.on("no-doctors-available", ({ message }) => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `⚠️ ${message}` 
        }]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [session?.user?.id]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    if (data.moodMusic) {
      setMusicUrl(data.moodMusic.url);
      setMusicName(data.moodMusic.name);
      setShowMusicModal(true);
    }

    if (data.escalate === true && session?.user?.email) {
      const result = await escalate(session.user.email);
      if (result?.requestId) {
        setCurrentRequestId(result.requestId);
        setIsPolling(true);
      }
      const suicidalMessage = { 
        role: "assistant", 
        content: "🚨 I've detected you might need immediate help. I'm connecting you with a doctor right now. Please hold on...",
        isSuicidalDetection: true
      };
      setMessages(prev => [...prev, suicidalMessage]);
      
      // Save session with suicidal detection
      await saveChatSession([...newMessages, suicidalMessage]);
    } else {
      // Save regular session
      await saveChatSession([...newMessages, { role: "assistant", content: data.reply }]);
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

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-emerald-200 rounded px-3 py-2"
          placeholder="Type your feelings..."
        />
        <button
          onClick={handleSend}
          disabled={escalating}
          className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {escalating ? "Escalating..." : "Send"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-2">Error: {error}</p>}

      <MusicModal
        open={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        url={musicUrl}
        name={musicName}
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