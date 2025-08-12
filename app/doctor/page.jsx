"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import DoctorEscalationPanel from "@/components/DoctorEscalationPanel";

import DoctorNavbar from "@/components/DoctorNavbar";

export default function DoctorPage() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ 
    totalRequests: 0, 
    activeChats: 0,
    acceptedToday: 0,
    totalAccepted: 0,
    avgRating: 0,
    hoursToday: 0
  });

  useEffect(() => {
    if (session?.user?.id) {
      updateOnlineStatus(true);
      setIsOnline(true);
      fetchStats();
      
      const statsInterval = setInterval(fetchStats, 30000);
      
      const handleBeforeUnload = () => {
        updateOnlineStatus(false);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(statsInterval);
        updateOnlineStatus(false);
      };
    }
  }, [session]);

  const fetchStats = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/doctor/stats?doctorId=${session.user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(prevStats => ({
          ...prevStats,
          ...data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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

  const handleStatusChange = async (newStatus) => {
    setIsOnline(newStatus);
    await updateOnlineStatus(newStatus);
  };

  const handleLogout = async () => {
    await updateOnlineStatus(false);
    await signOut({ callbackUrl: '/' });
  };

  if (!session?.user?.isDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-6xl mb-4 text-center">🚫</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Doctor login required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Navbar */}
      <DoctorNavbar 
        status={isOnline ? 'online' : 'offline'}
        doctorName={session.user.name}
        onStatusChange={handleStatusChange}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-4xl">👩⚕️</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome, Dr. {session.user.name}</h1>
            <p className="text-xl text-emerald-100 mb-6">Your Mental Health Practice Dashboard</p>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.acceptedToday}</p>
                <p className="text-emerald-100 text-sm">Patients Today</p>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalAccepted}</p>
                <p className="text-emerald-100 text-sm">Total Helped</p>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.avgRating}⭐</p>
                <p className="text-emerald-100 text-sm">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Status</p>
                <p className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                  {isOnline ? 'Available' : 'Offline'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div className={`w-6 h-6 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Pending Requests</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalRequests}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-800">{stats.activeChats}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Hours Today</p>
                <p className="text-2xl font-bold text-orange-800">{stats.hoursToday}h</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Patient Requests - Full width */}
          <div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100">
              <div className="p-6 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                        <span className="text-red-500 text-xl">🚨</span>
                      </div>
                      Patient Requests
                    </h3>
                    <p className="text-sm text-emerald-600 mt-2">Emergency and connection requests from patients</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600">Priority Queue</p>
                    <p className="text-lg font-semibold text-emerald-800">{stats.totalRequests} waiting</p>
                  </div>
                </div>
              </div>
              <DoctorEscalationPanel inline={true} />
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Accepted</p>
                <p className="text-3xl font-bold">{stats.totalAccepted}</p>
                <p className="text-emerald-100 text-xs mt-1">All time record</p>
              </div>
              <div className="text-4xl opacity-80">🏆</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Patient Rating</p>
                <p className="text-3xl font-bold">{stats.avgRating}⭐</p>
                <p className="text-blue-100 text-xs mt-1">Excellent feedback</p>
              </div>
              <div className="text-4xl opacity-80">🌟</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Impact Score</p>
                <p className="text-3xl font-bold">94%</p>
                <p className="text-purple-100 text-xs mt-1">Success rate</p>
              </div>
              <div className="text-4xl opacity-80">💝</div>
            </div>
          </div>
        </div>

        {/* Professional Guidelines */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg">
              <span className="text-white text-2xl">👩⚕️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-emerald-800 mb-4">Professional Workflow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <p className="text-emerald-700 text-sm">Toggle status to "Available" to receive requests</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <p className="text-emerald-700 text-sm">Emergency requests appear first - click "Accept & Help"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <p className="text-emerald-700 text-sm">Patient selects communication method (chat/video)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                    <p className="text-emerald-700 text-sm">Connection requests appear for final acceptance</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                    <p className="text-emerald-700 text-sm">Both parties redirected to secure session room</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">6</div>
                    <p className="text-emerald-700 text-sm">Provide compassionate mental health support</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/70 rounded-xl border border-emerald-200">
                <p className="text-emerald-800 text-sm font-medium flex items-center">
                  <span className="mr-2">🔒</span>
                  All sessions are end-to-end encrypted and HIPAA compliant for patient privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}