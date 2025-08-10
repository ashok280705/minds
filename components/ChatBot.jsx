"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEscalate } from "@/lib/hooks/useEscalate";
import MusicModal from "@/components/MusicModal";
import DoctorConnectionModal from "@/components/DoctorConnectionModal";
import { io } from "socket.io-client";

export default function ChatBot() {
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
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef(null);

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
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "🚨 I've detected you might need immediate help. I'm connecting you with a doctor right now. Please hold on..." 
      }]);
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