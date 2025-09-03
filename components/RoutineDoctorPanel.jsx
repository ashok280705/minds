"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Video, FileText, Clock, User, CheckCircle } from "lucide-react";

export default function RoutineDoctorPanel({ doctorId, doctorName, inline = false }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/routine-doctor/requests");
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching routine requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch("/api/routine-doctor/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          doctorId,
          doctorName
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.open(`/${data.connectionType}-room/${data.roomId}`, '_blank');
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handlePassRequest = async (requestId) => {
    try {
      const response = await fetch("/api/routine-doctor/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error passing request:", error);
    }
  };

  const getConnectionIcon = (type) => {
    return type === "video" ? Video : MessageSquare;
  };

  const getConnectionColor = (type) => {
    return type === "video" ? "green" : "blue";
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === "pending");

  return (
    <div className={inline ? "" : "bg-white rounded-2xl shadow-xl border border-orange-100"}>
      {!inline && (
        <div className="p-6 border-b border-orange-100">
          <h3 className="text-xl font-semibold text-orange-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
              <span className="text-orange-500 text-xl">🩺</span>
            </div>
            Routine Doctor Requests
          </h3>
          <p className="text-sm text-orange-600 mt-2">Patient consultation requests</p>
        </div>
      )}

      <div className="">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No routine requests at the moment</p>
            <p className="text-gray-400 text-sm mt-1">New consultation requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const ConnectionIcon = getConnectionIcon(request.connectionType);
              const color = getConnectionColor(request.connectionType);
              
              return (
                <div
                  key={request._id}
                  className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.userName}</h4>
                          <p className="text-sm text-gray-600">{request.userEmail}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            request.connectionType === 'video' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <ConnectionIcon className={`w-4 h-4 ${
                              request.connectionType === 'video' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                            <span className={`text-sm font-medium capitalize ${
                              request.connectionType === 'video' ? 'text-green-700' : 'text-blue-700'
                            }`}>
                              {request.connectionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(request.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {request.note && (
                        <div className="bg-white/70 rounded-lg p-3 mb-3 border border-orange-100">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Patient Note:</p>
                              <p className="text-sm text-gray-600">{request.note}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Request Type: Routine Consultation</span>
                          <span>•</span>
                          <span>Status: Waiting for doctor</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePassRequest(request._id)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept & Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}