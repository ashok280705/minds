"use client";

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { PorcupineWorker } from '@picovoice/porcupine-web';

export default function VapiGenie() {
  const [status, setStatus] = useState('waiting');
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const vapiRef = useRef(null);
  const porcupineRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    console.log('🧞♂️ Starting Vapi Genie with Porcupine...');
    
    // Initialize Porcupine wake word detection
    initializePorcupine();
    
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
      if (porcupineRef.current) {
        porcupineRef.current.terminate();
      }
    };
  }, []);
  
  const initializePorcupine = async () => {
    console.log('🔊 Skipping Porcupine - using enhanced browser detection...');
    
    // Skip Porcupine and use enhanced browser wake word
    startEnhancedWakeWord();
  };
  
  const startEnhancedWakeWord = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      console.log('✅ Vapi Server Started');
      console.log('✅ Enhanced Wake Word Detection Ready');
      console.log('✅ Listening for "Hey Genie"...');
      
      startBrowserWakeWord();
      
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      alert('Please allow microphone access for Genie to work!');
    }
  };
  
  const startBrowserWakeWord = () => {
    if (isListening || recognitionRef.current) return;
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('🎤 READY - Say "Genie"');
        setIsListening(true);
        setStatus('waiting');
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('🎤 HEARD:', transcript);
        
        // Check for wake words in the transcript
        const wakeWords = ['genie', 'jini', 'jini se', 'genius', 'jenny', 'hello', 'hey genie'];
        let wakeWordFound = false;
        
        for (const word of wakeWords) {
          if (transcript.includes(word)) {
            console.log('✅ WAKE WORD "' + word + '" DETECTED!');
            wakeWordFound = true;
            break;
          }
        }
        
        if (wakeWordFound) {
          console.log('✅ 🎉 ACTIVATING GENIE!');
          cleanup();
          startVapiCall();
          return;
        }
        
        console.log('❌ No wake word found, continuing to listen...');
        cleanup();
        setTimeout(startBrowserWakeWord, 1000);
      };
      
      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'aborted') {
          console.log('Recognition error:', event.error);
        }
        cleanup();
        setTimeout(startBrowserWakeWord, 3000);
      };
      
      recognitionRef.current.onend = () => {
        cleanup();
        if (!isConnected && status === 'waiting') {
          setTimeout(startBrowserWakeWord, 2000);
        }
      };
      
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('Recognition setup failed:', error);
      cleanup();
      setTimeout(startBrowserWakeWord, 5000);
    }
  };
  
  const cleanup = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const startVapiCall = async () => {
    console.log('🚀 Starting Vapi call...');
    
    try {
      // Initialize Vapi if not already done
      if (!vapiRef.current) {
        const publicKey = 'c38384c7-317c-41f9-8831-77904c95adef';
        vapiRef.current = new Vapi(publicKey);
        
        // Set up event listeners
        vapiRef.current.on('call-start', () => {
          console.log('✅ Vapi call started');
          setIsConnected(true);
          setStatus('listening');
        });
        
        vapiRef.current.on('call-end', () => {
          console.log('📞 Vapi call ended');
          setIsConnected(false);
          setStatus('waiting');
          // Restart wake word detection
          setTimeout(() => {
            if (!isConnected) {
              startBrowserWakeWord();
            }
          }, 1000);
        });
        
        vapiRef.current.on('speech-start', () => {
          console.log('🎤 User speaking');
          setStatus('listening');
        });
        
        vapiRef.current.on('speech-end', () => {
          console.log('🎤 User stopped speaking');
          setStatus('processing');
        });
        
        vapiRef.current.on('message', (message) => {
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            console.log('📝 User said:', message.transcript);
          }
        });
        
        vapiRef.current.on('error', (error) => {
          console.log('📞 Vapi event (handling gracefully):', error?.message || 'Unknown');
          if (error?.message?.includes('Meeting has ended') || error?.message?.includes('Call ended')) {
            // Normal call end - not an error
            setIsConnected(false);
            setStatus('waiting');
            setTimeout(() => {
              if (!isConnected) {
                startBrowserWakeWord();
              }
            }, 1000);
          } else {
            console.error('❌ Actual Vapi error:', error);
            setIsConnected(false);
            setStatus('waiting');
            setTimeout(() => startBrowserWakeWord(), 2000);
          }
        });
      }
      
      setStatus('connecting');
      
      const assistantConfig = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are Genie, a helpful AI assistant for mental health support. Respond briefly and helpfully.'
            }
          ]
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-US'
        },
        firstMessage: 'Hey! I am Genie. How can I assist you?'
      };
      
      await vapiRef.current.start(assistantConfig);
      
    } catch (error) {
      console.error('❌ Failed to start Vapi call:', error);
      setStatus('waiting');
      setTimeout(startWakeWordDetection, 2000);
    }
  };

  const stopVapiCall = () => {
    console.log('🛑 Stopping Vapi call...');
    if (vapiRef.current && isConnected) {
      try {
        vapiRef.current.stop();
      } catch (error) {
        console.log('Stop call (expected):', error?.message || 'Call ended');
      } finally {
        setIsConnected(false);
        setStatus('waiting');
        setTimeout(() => startBrowserWakeWord(), 1000);
      }
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-spin';
      case 'connecting': return 'bg-blue-500 animate-bounce';
      case 'waiting': return 'bg-black';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'connecting': return 'Connecting...';
      case 'waiting': return 'Say "Hey Genie"';
      default: return 'Ready';
    }
  };

  return (
    <>
      {/* Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`w-8 h-8 rounded-full transition-all shadow-lg flex items-center justify-center ${getStatusColor()}`}>
          <span className="text-white text-lg">
            {status === 'listening' ? '🎤' :
             status === 'processing' ? '🧠' :
             status === 'connecting' ? '📞' :
             status === 'error' ? '❌' :
             '🧞'}
          </span>
        </div>
        <div className="absolute top-9 right-0 text-xs text-gray-600 whitespace-nowrap">
          {getStatusText()}
        </div>
      </div>


    </>
  );
}