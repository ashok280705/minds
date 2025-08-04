"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

export default function DoctorEscalationPanel({ inline = false }) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!session?.user?.isDoctor || !session?.user?.id) return;

    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.emit("register-doctor", { doctorId: session.user.id });

    socketInstance.on("escalation-request", (request) => {
      setRequests(prev => [...prev, request]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const handleAccept = async (request) => {
    try {
      const response = await fetch("/api/escalate/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.requestId,
        }),
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.requestId !== request.requestId));
      }
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleReject = async (request) => {
    try {
      const response = await fetch("/api/escalate/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.requestId,
        }),
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.requestId !== request.requestId));
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (!session?.user?.isDoctor) return null;

  const containerClass = inline 
    ? "p-6" 
    : "fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50";

  return (
    <div className={containerClass}>
      {!inline && <h3 className="font-bold text-lg mb-3">Escalation Requests</h3>}
      
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">💭</div>
          <p className="text-gray-500">No pending emergency requests</p>
          <p className="text-sm text-gray-400 mt-1">You'll be notified when users need help</p>
        </div>
      ) : (
        <div className={inline ? "grid gap-4" : "space-y-3"}>
          {requests.map((request, index) => (
            <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{request.userName}</p>
                  <p className="text-sm text-gray-600">{request.userEmail}</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  URGENT
                </span>
              </div>
              
              <div className="bg-red-100 border border-red-200 rounded p-2 mb-3">
                <p className="text-xs text-red-700 flex items-center gap-1">
                  <span>🚨</span>
                  User is in emotional distress and needs immediate support
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request)}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                >
                  Accept & Help
                </button>
                <button
                  onClick={() => handleReject(request)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                >
                  Pass to Another
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}