"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  Brain, 
  FileText, 
  Pill, 
  Heart, 
  Shield, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Activity,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Star,
  CheckCircle
} from "lucide-react";
import PeriodStatusWidget from "@/components/PeriodStatusWidget";

export default function ModernDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userGender, setUserGender] = useState(null);
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    weeklyProgress: 0,
    currentStreak: 0,
    wellnessScore: 85
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setUserGender(data.user?.gender);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // This would be replaced with actual API calls
      setUserStats({
        totalSessions: 12,
        weeklyProgress: 75,
        currentStreak: 5,
        wellnessScore: 85
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleMentalCounselorClick = async () => {
    const res = await fetch("/api/user/profile");
    const data = await res.json();

    if (data.isComplete) {
      router.push("/dashboard/mental-counselor");
    } else {
      router.push("/profile");
    }
  };

  const handleReportsClick = () => {
    router.push("/dashboard/reports-analyzer");
  };

  const handlePharmacyClick = () => {
    router.push("/dashboard/pharmacy");
  };

  const services = [
    {
      id: 'counselor',
      title: 'AI Mental Counselor',
      description: 'Connect with your empathetic AI companion for personalized mental health support, mood analysis, and crisis intervention.',
      icon: Brain,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      features: ['24/7 AI Support', 'Mood Analysis', 'Crisis Detection', 'Music Therapy'],
      onClick: handleMentalCounselorClick,
      stats: { sessions: userStats.totalSessions, rating: '4.9/5' }
    },
    {
      id: 'reports',
      title: 'Medical Reports Analyzer',
      description: 'Upload and analyze your medical reports with AI-powered insights for better health understanding.',
      icon: FileText,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      features: ['AI Analysis', 'Health Trends', 'Report Insights', 'Progress Tracking'],
      onClick: handleReportsClick,
      stats: { reports: 3, accuracy: '95%' }
    },
    {
      id: 'pharmacy',
      title: 'Online Pharmacy',
      description: 'Order trusted medications at affordable prices with convenient doorstep delivery and prescription management.',
      icon: Pill,
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      features: ['Trusted Medicines', 'Affordable Prices', 'Home Delivery', 'Prescription Tracking'],
      onClick: handlePharmacyClick,
      stats: { orders: 2, savings: '30%' }
    }
  ];

  const quickActions = [
    {
      title: 'Start Chat Session',
      description: 'Begin a new conversation with your AI counselor',
      icon: MessageSquare,
      color: 'emerald',
      onClick: handleMentalCounselorClick
    },
    {
      title: 'View Chat History',
      description: 'Review your previous conversations',
      icon: Clock,
      color: 'blue',
      onClick: () => router.push('/dashboard/mental-counselor/chat-history')
    },
    {
      title: 'Upload Report',
      description: 'Analyze a new medical report',
      icon: FileText,
      color: 'purple',
      onClick: handleReportsClick
    },
    {
      title: 'Track Period',
      description: 'Log your menstrual cycle data',
      icon: Calendar,
      color: 'pink',
      onClick: () => router.push('/dashboard/mental-counselor/period-tracker'),
      hidden: userGender !== 'female'
    }
  ];

  const achievements = [
    { title: 'First Session', description: 'Completed your first AI counseling session', icon: Star, earned: true },
    { title: 'Weekly Warrior', description: 'Used the platform for 7 consecutive days', icon: Award, earned: userStats.currentStreak >= 7 },
    { title: 'Self-Care Champion', description: 'Completed 10 counseling sessions', icon: Heart, earned: userStats.totalSessions >= 10 },
    { title: 'Progress Tracker', description: 'Uploaded your first medical report', icon: TrendingUp, earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                How are you feeling today? I'm here to support your mental wellness journey.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">


        {/* Period Status Widget for Female Users */}
        {userGender === "female" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Period Health Tracker</h2>
            <PeriodStatusWidget />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.filter(action => !action.hidden).map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-4 rounded-xl border-2 border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 text-left group`}
              >
                <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Services */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Wellness Services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  achievement.earned
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  achievement.earned
                    ? 'bg-yellow-100'
                    : 'bg-gray-200'
                }`}>
                  <achievement.icon className={`w-5 h-5 ${
                    achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm ${
                  achievement.earned ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Earned</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">
            You're doing great! 🌟
          </h2>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            Remember, taking care of your mental health is a journey, not a destination. 
            Every step you take towards wellness matters, and I'm here to support you every step of the way.
          </p>
          <button
            onClick={handleMentalCounselorClick}
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <MessageSquare className="w-5 h-5" />
            Start a Session
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div
      onClick={service.onClick}
      className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <service.icon className="text-white w-7 h-7" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {service.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full`}></div>
            <span className="text-sm font-medium text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className={`bg-gradient-to-r ${service.bgGradient} rounded-xl p-3 border border-gray-100`}>
        <div className="flex items-center justify-between text-sm">
          {Object.entries(service.stats).map(([key, value], index) => (
            <div key={index} className="text-center">
              <p className="font-semibold text-gray-900">{value}</p>
              <p className="text-gray-600 capitalize">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}