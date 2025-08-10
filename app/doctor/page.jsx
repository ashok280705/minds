"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DoctorEscalationPanel from "@/components/DoctorEscalationPanel";

export default function DoctorPage() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ totalRequests: 0, activeChats: 0 });

  useEffect(() => {
    if (session?.user?.id) {
      updateOnlineStatus(true);
      setIsOnline(true);
    }

    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateOnlineStatus(false);
    };
  }, [session]);

  const updateOnlineStatus = async (status) => {
    if (!session?.user?.id) return;
    
    try {
      await fetch('/api/doctor/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: session.user.id,
          isOnline: status
        })
      });
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    await updateOnlineStatus(newStatus);
    setIsOnline(newStatus);
  };

  if (!session?.user?.isDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Doctor login required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Dr. {session.user.name}</p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md ${
                isOnline 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white shadow-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-green-200' : 'bg-gray-200'
                }`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                isOnline ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <div className={`w-6 h-6 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${
                  isOnline ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isOnline ? 'Available' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-purple-600 text-xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-lg font-semibold text-gray-900">{stats.activeChats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-red-500">🚨</span>
              Patient Requests
            </h3>
            <p className="text-sm text-gray-600 mt-1">Emergency requests and connection requests from patients</p>
          </div>
          <DoctorEscalationPanel inline={true} />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <span className="text-blue-500 text-xl mr-3">ℹ️</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Toggle your status to "Online" to receive emergency requests</li>
                <li>• Emergency requests appear first - click "Accept & Help" to respond</li>
                <li>• After accepting, patient will choose chat or video</li>
                <li>• Connection requests will then appear for you to accept</li>
                <li>• Both you and patient will be redirected to the session room</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}