"use client";

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { PorcupineWorker } from '@picovoice/porcupine-web';

export default function VapiGenie() {
  const [status, setStatus] = useState('initializing');
  const [isConnected, setIsConnected] = useState(false);
  
  const vapiRef = useRef(null);
  const porcupineRef = useRef(null);

  useEffect(() => {
    console.log('🧞♂️ Starting Genie: Porcupine + Vapi + Gemini');
    initializeGenie();
    
    return () => {
      if (porcupineRef.current) {
        porcupineRef.current.terminate();
      }
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {}
      }
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
      
      const publicKey = 'a4e52b1b-a945-4d62-92ba-69a11ee1e534';
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
      
      vapiRef.current.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          console.log('📝 User said:', message.transcript);
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
        'a4e52b1b-a945-4d62-92ba-69a11ee1e534', // Your public key
        ['Porcupine'], // Built-in keyword
        (keywordIndex) => {
          console.log('✅ "PORCUPINE" WAKE WORD DETECTED! Starting Vapi...');
          startVapiConversation();
        }
      );
      
      console.log('✅ Porcupine initialized - Say "Porcupine" to activate');
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
        
        if (transcript.includes('genie') || transcript.includes('hey genie') || transcript.includes('jini')) {
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

  const startVapiConversation = async () => {
    try {
      console.log('🚀 Starting Vapi conversation...');
      setStatus('connecting');
      
      // Start Vapi call with your assistant
      await vapiRef.current.start('eb36ab39-e5bb-4d29-9dc8-06dc0c2e9da6');
      
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
      case 'waiting': return 'Say "Hey Genie"';
      case 'initializing': return 'Starting...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="w-10 h-10 rounded-full bg-black shadow-lg flex items-center justify-center transition-all">
        <span className="text-white text-lg">
          {status === 'listening' ? '🎤' :
           status === 'processing' ? '🧠' :
           status === 'connecting' ? '📞' :
           status === 'initializing' ? '⚙️' :
           status === 'error' ? '❌' :
           '🧞'}
        </span>
      </div>
      <div className="absolute top-12 right-0 text-xs text-gray-600 whitespace-nowrap bg-white px-2 py-1 rounded shadow">
        {getStatusText()}
      </div>
    </div>
  );
}