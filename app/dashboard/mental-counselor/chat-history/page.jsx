"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ChatHistoryPage() {
  const { data: session } = useSession();
  const [chatHistory, setChatHistory] = useState([]);
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

  if (selectedSession) {
    return (
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Chat Session</h1>
          <button
            onClick={() => setSelectedSession(null)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            ← Back to History
          </button>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-6 shadow">
          <p className="text-sm text-blue-600 mb-4">
            Session from {new Date(selectedSession.createdAt).toLocaleString()}
          </p>
          <div className="h-96 overflow-y-auto">
            {selectedSession.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "text-blue-800 bg-blue-50 p-2 rounded"
                    : "text-blue-600 text-right"
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
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Chat History</h1>
        <Link
          href="/dashboard/mental-counselor"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          ← Back to Mental Dashboard
        </Link>
      </div>
      
      <div className="bg-white border border-blue-200 rounded-xl p-6 shadow">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Previous Sessions</h2>
        {chatHistory.length === 0 ? (
          <p className="text-blue-600">No previous sessions found.</p>
        ) : (
          <div className="space-y-3">
            {chatHistory.map((session, idx) => (
              <div
                key={session._id}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => setSelectedSession(session)}
              >
                <div>
                  <p className="font-medium text-blue-800">
                    Session {chatHistory.length - idx}
                  </p>
                  <p className="text-sm text-blue-600">
                    {new Date(session.createdAt).toLocaleDateString()} - {session.messages.length} messages
                    {session.messages.some(m => m.isSuicidalDetection) && (
                      <span className="ml-2 text-red-600 text-xs">🚨 Crisis detected</span>
                    )}
                  </p>
                </div>
                <span className="text-blue-500">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}