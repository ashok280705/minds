"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import DoctorEscalationPanel from "@/components/DoctorEscalationPanel";
import DoctorFeedback from "@/components/DoctorFeedback";
import RoutineDoctorPanel from "@/components/RoutineDoctorPanel";
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
      // Force doctor online when dashboard loads
      updateOnlineStatus(true);
      setIsOnline(true);
      fetchStats();
      
      const statsInterval = setInterval(fetchStats, 30000);
      
      // Also refresh online status every 30 seconds to ensure it stays online
      const statusInterval = setInterval(() => {
        if (isOnline) {
          updateOnlineStatus(true);
        }
      }, 30000);
      
      const handleBeforeUnload = () => {
        updateOnlineStatus(false);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(statsInterval);
        clearInterval(statusInterval);
        updateOnlineStatus(false);
      };
    }
  }, [session, isOnline]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navbar */}
      <DoctorNavbar 
        status={isOnline ? 'online' : 'offline'}
        doctorName={session.user.name}
        onStatusChange={handleStatusChange}
        onLogout={handleLogout}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">👩⚕️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dr. {session.user.name}</h1>
                <p className="text-gray-600">Mental Health Professional</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.acceptedToday}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalAccepted}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.avgRating}⭐</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-xl font-bold ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Queue</p>
                <p className="text-xl font-bold text-red-600">{stats.totalRequests}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-xl font-bold text-blue-600">{stats.activeChats}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">💬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Today</p>
                <p className="text-xl font-bold text-purple-600">{stats.hoursToday}h</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Emergency Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">🚨</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Requests</h3>
                  <p className="text-sm text-gray-600">High priority mental health cases</p>
                </div>
              </div>
            </div>
            <DoctorEscalationPanel inline={true} />
          </div>

          {/* Routine Consultations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🩺</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Routine Consultations</h3>
                  <p className="text-sm text-gray-600">General healthcare requests</p>
                </div>
              </div>
            </div>
            <RoutineDoctorPanel doctorId={session?.user?.id} doctorName={session?.user?.name} inline={true} />
          </div>
        </div>

        {/* Patient Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⭐</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Feedback</h3>
                <p className="text-sm text-gray-600">Recent session ratings and reviews</p>
              </div>
            </div>
          </div>
          <DoctorFeedback doctorId={session?.user?.id} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Patients Helped</p>
                <p className="text-3xl font-bold">{stats.totalAccepted}</p>
              </div>
              <div className="text-3xl opacity-80">🏆</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold">{stats.avgRating}⭐</p>
              </div>
              <div className="text-3xl opacity-80">🌟</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold">94%</p>
              </div>
              <div className="text-3xl opacity-80">💝</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}