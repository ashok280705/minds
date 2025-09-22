"use client";

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { PorcupineWorker } from '@picovoice/porcupine-web';
import { X, Minus } from 'lucide-react';

export default function VapiGenie() {
  const [status, setStatus] = useState('initializing');
  const [isConnected, setIsConnected] = useState(false);
  const [isGenieActive, setIsGenieActive] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMode, setChatMode] = useState('text'); // 'text' or 'voice'
  const [isMuted, setIsMuted] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  const vapiRef = useRef(null);
  const porcupineRef = useRef(null);

  useEffect(() => {
    console.log('🧞♂️ Starting Genie: Porcupine + Vapi + Gemini');
    initializeGenie();
    
    // Start prescription notification polling
    const prescriptionInterval = setInterval(checkPrescriptionNotifications, 5000);
    
    return () => {
      if (porcupineRef.current) {
        porcupineRef.current.terminate();
      }
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {}
      }
      clearInterval(prescriptionInterval);
    };
  }, []);
  
  const initializeGenie = async () => {
    try {
      // Initialize Vapi first
      await initializeVapi();
      
      // Then initialize Porcupine wake word
      await initializePorcupine();
      
    } catch (error) {
      console.error('❌ Genie initialization failed:', error);
      setStatus('error');
    }
  };
  
  const initializeVapi = async () => {
    try {
      console.log('🔧 Initializing Vapi...');
      
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '7bb2a0d9-6efc-4df5-b86c-e73ea12b1939';
      vapiRef.current = new Vapi(publicKey);
      
      // Set up Vapi event listeners
      vapiRef.current.on('call-start', () => {
        console.log('✅ Vapi call started - Genie is listening');
        setIsConnected(true);
        setStatus('listening');
      });
      
      vapiRef.current.on('call-end', () => {
        console.log('📞 Vapi call ended - Back to wake word detection');
        setIsConnected(false);
        setStatus('waiting');
      });
      
      vapiRef.current.on('speech-start', () => {
        console.log('🎤 User speaking...');
        setStatus('listening');
      });
      
      vapiRef.current.on('speech-end', () => {
        console.log('🧠 Processing with Gemini...');
        setStatus('processing');
      });
      
      vapiRef.current.on('message', async (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          console.log('📝 User said:', message.transcript);
          
          // Check if user wants doctor connection
          const transcript = message.transcript.toLowerCase();
          if (transcript.includes('connect') && (transcript.includes('doc') || transcript.includes('doctor'))) {
            console.log('🩺 Doctor connection requested!');
            await handleDoctorConnection();
          }
        }
      });
      
      vapiRef.current.on('error', (error) => {
        console.error('❌ Vapi error:', error);
        setIsConnected(false);
        setStatus('waiting');
      });
      
      console.log('✅ Vapi initialized');
      
    } catch (error) {
      console.error('❌ Vapi initialization failed:', error);
      throw error;
    }
  };
  
  const initializePorcupine = async () => {
    try {
      console.log('🔊 Initializing Porcupine wake word detection...');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      porcupineRef.current = await PorcupineWorker.create(
        process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '7bb2a0d9-6efc-4df5-b86c-e73ea12b1939',
        ['Porcupine'], // Built-in keyword
        (keywordIndex) => {
          console.log('✅ "PORCUPINE" WAKE WORD DETECTED! Starting Multilingual Genie...');
          startVapiConversation();
        }
      );
      
      console.log('✅ Multilingual Genie initialized - Say "Porcupine" or "Hey Genie" to activate');
      setStatus('waiting');
      
    } catch (error) {
      // Silent fallback to browser wake word
      startBrowserWakeWord();
    }
  };
  
  const startBrowserWakeWord = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('🎤 Browser heard:', transcript);
        
        if (isGenieActive && (transcript.includes('genie') || transcript.includes('hey genie') || transcript.includes('jini'))) {
          console.log('✅ Browser wake word detected! Starting Vapi...');
          recognition.stop();
          startVapiConversation();
        }
      };
      
      recognition.start();
      setStatus('waiting');
      console.log('✅ Browser wake word active - Say "Hey Genie"');
      
    } catch (error) {
      console.error('❌ Browser wake word failed:', error);
      setStatus('error');
    }
  };

  const handleDoctorConnection = async () => {
    try {
      // Use consistent userId throughout the process
      const userId = localStorage.getItem('vapiUserId') || 'vapi-user-' + Date.now();
      localStorage.setItem('vapiUserId', userId);
      
      // Step 1: Create routine doctor request automatically
      const response = await fetch('/api/routine-doctor/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: 'Vapi User',
          userEmail: 'vapi@minds.com',
          connectionType: 'video',
          note: 'Vapi Genie automated video call request',
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Doctor request created:', data.requestId);
        
        // Step 2: Poll for doctor acceptance
        pollForDoctorAcceptance(data.requestId);
      }
    } catch (error) {
      console.error('❌ Doctor connection error:', error);
    }
  };

  const pollForDoctorAcceptance = async (requestId) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/routine-doctor/status?requestId=${requestId}`);
        const data = await response.json();
        
        if (data.status === 'accepted' && data.roomId) {
          console.log('🎉 Doctor accepted! Redirecting to video room...');
          
          // Step 3: Auto-redirect to video room with proper params
          setTimeout(() => {
            const userId = localStorage.getItem('vapiUserId');
            window.location.href = `/video-room/${data.roomId}?userId=${userId}&type=video`;
          }, 1000);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          console.log('⏰ No doctors available');
        }
      } catch (error) {
        console.error('❌ Error checking status:', error);
      }
    };
    
    checkStatus();
  };

  const checkPrescriptionNotifications = async () => {
    try {
      const userId = localStorage.getItem('vapiUserId');
      if (!userId) return;
      
      const response = await fetch(`/api/prescription/realtime?userId=${userId}`);
      const data = await response.json();
      
      if (data.hasNewPrescription) {
        speak('Excellent news! Your prescription has been received from the doctor. You can view it in your prescriptions section.');
        console.log('📜 Prescription notification spoken by Genie');
      }
    } catch (error) {
      console.error('❌ Error checking prescriptions:', error);
    }
  };

  const speak = (text) => {
    // Only use Vapi for voice synthesis, no local speech
    if (!isMuted && vapiRef.current && isConnected) {
      try {
        vapiRef.current.send({
          type: 'add-message',
          message: {
            role: 'assistant',
            content: text
          }
        });
      } catch (error) {
        console.error('Error sending to Vapi for speech:', error);
      }
    }
  };

  const startVapiConversation = async () => {
    try {
      console.log('🚀 Starting Vapi conversation...');
      setStatus('connecting');
      
      // Start with the new Genie assistant
      await vapiRef.current.start('9be02aa3-0572-406c-be3c-cc6dd85176ce');
      
    } catch (error) {
      console.error('❌ Failed to start Vapi conversation:', error);
      setStatus('waiting');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-spin';
      case 'connecting': return 'bg-blue-500 animate-bounce';
      case 'waiting': return 'bg-purple-600';
      case 'initializing': return 'bg-gray-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Thinking...';
      case 'connecting': return 'Connecting...';
      case 'waiting': return 'Say &quot;Hey Genie&quot;';
      case 'initializing': return 'Starting...';
      case 'error': return 'Error';
      case 'off': return 'Genie Off';
      default: return 'Ready';
    }
  };

  const toggleGenie = async () => {
    if (isConnected) {
      // Stop current Vapi call
      try {
        await vapiRef.current.stop();
        setIsConnected(false);
        setStatus('waiting');
      } catch (error) {
        console.error('Error stopping Vapi:', error);
      }
    } else {
      // Start Vapi call directly (same as wake word)
      await startVapiConversation();
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const userMessage = chatMessage;
    setChatMessage('');
    
    try {
      // Use existing gemini-chat API
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [
            {
              role: 'system',
              content: 'You are Genie, a helpful AI assistant. Respond naturally and helpfully in the same language the user is using. Keep responses concise and friendly.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          userId: localStorage.getItem('vapiUserId') || 'genie-user'
        })
      });
      
      const data = await response.json();
      if (data.reply) {
        setChatResponse(data.reply);
        
        // Voice mode: Only use Genie's Vapi voice
        if (chatMode === 'voice' && !isMuted) {
          try {
            // Ensure Vapi connection for Genie's voice
            if (!isConnected && vapiRef.current) {
              console.log('🎤 Starting Vapi for Genie voice...');
              await vapiRef.current.start('9be02aa3-0572-406c-be3c-cc6dd85176ce');
              // Wait a moment for connection to establish
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Send to Vapi for Genie's voice synthesis only
            if (vapiRef.current && isConnected) {
              await vapiRef.current.send({
                type: 'add-message',
                message: {
                  role: 'assistant',
                  content: data.reply
                }
              });
              console.log('🗣️ Genie speaking:', data.reply.substring(0, 50) + '...');
            } else {
              console.log('⚠️ Genie voice not available - Vapi not connected');
            }
          } catch (error) {
            console.error('❌ Genie voice error:', error);
          }
        }
      } else {
        setChatResponse('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatResponse('Sorry, I encountered an error. Please try again.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="fixed top-16 right-4 z-50" style={{ top: 'calc(64px + 5px)' }}>
      <div className="relative flex items-center gap-2">
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-20 top-0 bg-white rounded-lg shadow-xl border p-2 w-32 z-40">
            <button
              onClick={() => {
                toggleGenie();
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                isConnected ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isConnected ? '⏹️ Stop' : '▶️ Start'}
            </button>
            <button
              onClick={() => {
                setShowChat(!showChat);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 text-blue-600"
            >
              💬 Chat
            </button>
          </div>
        )}
        
        {/* Dropdown Toggle Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-8 h-8 rounded-full bg-black shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
        >
          <span className="text-white text-sm">{showDropdown ? '▲' : '▼'}</span>
        </button>
        
        {/* Main Genie */}
        <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isGenieActive ? 'bg-black' : 'bg-gray-400'
        }`}>
          <span className="text-white text-lg">
            {!isGenieActive ? '😴' :
             status === 'listening' ? '🎤' :
             status === 'processing' ? '🧠' :
             status === 'connecting' ? '📞' :
             status === 'initializing' ? '⚙️' :
             status === 'error' ? '❌' :
             '🧞'}
          </span>
        </div>
      </div>
      
      {/* Status Text */}
      <div className="text-xs text-black whitespace-nowrap mt-2">
        {isConnected ? 'Active' : 'Say "Hey Genie"'} {isMuted ? '(Muted)' : ''}
      </div>
      
      {/* Chat Box */}
      {showChat && (
        <div className="bg-white rounded-lg shadow-xl border p-3 w-64 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-800">Chat with Genie</div>
            <div className="flex items-center gap-1">
              {chatMode === 'voice' && (
                <button
                  onClick={() => {
                    const newMuteState = !isMuted;
                    setIsMuted(newMuteState);
                    
                    // Stop current speech if muting
                    if (newMuteState && vapiRef.current && isConnected) {
                      try {
                        vapiRef.current.send({
                          type: 'stop-speaking'
                        });
                        console.log('🔇 Genie muted - stopping speech');
                      } catch (error) {
                        console.error('Error stopping speech:', error);
                      }
                    } else if (!newMuteState) {
                      console.log('🔊 Genie unmuted');
                    }
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isMuted ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              )}
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white"
                title="Minimize"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowChat(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {!isChatMinimized && (
            <>
              {/* Chat Mode Toggle */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setChatMode('text')}
                  className={`px-2 py-1 text-xs rounded ${
                    chatMode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Text Only
                </button>
                <button
                  onClick={() => setChatMode('voice')}
                  className={`px-2 py-1 text-xs rounded ${
                    chatMode === 'voice' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Text + Voice
                </button>
              </div>
              
              {(chatResponse || isProcessing) && (
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2 max-h-20 overflow-y-auto">
                  {isProcessing ? 'Thinking...' : chatResponse}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                  placeholder="Type in any language..."
                  className="flex-1 text-xs border rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatMessage.trim() || isProcessing}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Send'}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Mode: {chatMode === 'text' ? 'Text response only' : 'Text + Voice response'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}