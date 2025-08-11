"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChatBot from "@/components/ChatBot";

export default function MentalCounselorPage() {
  const { data: session } = useSession();
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat-history?userId=${session.user.id}`);
      const data = await response.json();
      if (response.ok) {
        setChatHistory(data.chatHistory);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const viewSession = (session) => {
    setSelectedSession(session);
  };

  if (selectedSession) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-emerald-800">Chat Session</h1>
          <button
            onClick={() => setSelectedSession(null)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
          >
            ← Back to Current Chat
          </button>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow">
          <p className="text-sm text-emerald-600 mb-4">
            Session from {new Date(selectedSession.createdAt).toLocaleString()}
          </p>
          <div className="h-96 overflow-y-auto">
            {selectedSession.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "text-emerald-800 bg-emerald-50 p-2 rounded"
                    : "text-emerald-600 text-right"
                } ${msg.isSuicidalDetection ? 'border-l-4 border-red-500' : ''}`}
              >
                {msg.isSuicidalDetection && (
                  <span className="text-red-600 text-xs block mb-1">🚨 Crisis Detection</span>
                )}
                {msg.content}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-emerald-800">Your AI Mental Counselor</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
        >
          {showHistory ? 'Hide History' : 'View Chat History'}
        </button>
      </div>
      
      {showHistory && (
        <div className="mb-6 bg-white border border-emerald-200 rounded-xl p-4 shadow">
          <h2 className="text-xl font-semibold text-emerald-800 mb-3">Previous Sessions</h2>
          {chatHistory.length === 0 ? (
            <p className="text-emerald-600">No previous sessions found.</p>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((session, idx) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 cursor-pointer"
                  onClick={() => viewSession(session)}
                >
                  <div>
                    <p className="font-medium text-emerald-800">
                      Session {chatHistory.length - idx}
                    </p>
                    <p className="text-sm text-emerald-600">
                      {new Date(session.createdAt).toLocaleDateString()} - {session.messages.length} messages
                      {session.messages.some(m => m.isSuicidalDetection) && (
                        <span className="ml-2 text-red-600 text-xs">🚨 Crisis detected</span>
                      )}
                    </p>
                  </div>
                  <span className="text-emerald-500">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <ChatBot onSessionSave={fetchChatHistory} />
    </div>
  );
}