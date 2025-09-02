"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Brain, FileText, Pill, Heart, Shield, Clock, ArrowRight, Sparkles } from "lucide-react";
import PeriodStatusWidget from "@/components/PeriodStatusWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userGender, setUserGender] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
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

  const handleMentalCounselorClick = async () => {
    // Check profile completeness
    const res = await fetch("/api/user/profile");
    const data = await res.json();

    if (data.isComplete) {
      router.push("/dashboard/mental-counselor");
    } else {
      router.push("/profile");
    }
  };

  const handleReportsClick = () => {
    router.push("/dashboard/report_analysis");
  };

  const handlePharmacyClick = () => {
    router.push("/dashboard/pharmacy");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-10 w-24 h-24 bg-slate-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-3xl">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Heart className="text-white w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-blue-800">Welcome to </span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Clarity Care 3.0
            </span>
          </h1>
          
          <p className="text-lg text-blue-700/80 font-medium mb-6">
            Your comprehensive AI healthcare platform
          </p>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-blue-600/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>AI-Powered Care</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
          </div>
        </div>

        {/* Period Status Widget for Female Users */}
        {userGender === "female" && (
          <div className="mb-8 max-w-md mx-auto">
            <PeriodStatusWidget />
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Mental Counselor Card */}
          <ServiceCard
            onClick={handleMentalCounselorClick}
            icon={<Brain className="w-8 h-8" />}
            title="AI Mental Counselor"
            description="Connect with your AI mental health companion for personalized support, mood-based music therapy, and crisis intervention with real doctor consultations."
            features={["AI Companion", "Mood Analysis", "Crisis Detection", "Music Therapy"]}
            gradient="from-blue-400 to-indigo-500"
            accentColor="blue"
          />

          {/* Reports Analyzer Card */}
          <ServiceCard
            onClick={handleReportsClick}
            icon={<FileText className="w-8 h-8" />}
            title="Medical Reports Analyzer"
            description="Upload and analyze your medical reports with AI-powered insights. Get clear understanding of your health trends and recommendations."
            features={["AI Analysis", "Health Trends", "Report Insights", "Progress Tracking"]}
            gradient="from-indigo-400 to-purple-500"
            accentColor="indigo"
          />

          {/* Pharmacy Card */}
          <ServiceCard
            onClick={handlePharmacyClick}
            icon={<Pill className="w-8 h-8" />}
            title="Smart Pharmacy"
            description="Order trusted medications at affordable prices with convenient doorstep delivery and prescription management."
            features={["Trusted Medicines", "Affordable Prices", "Home Delivery", "Prescription Tracking"]}
            gradient="from-purple-400 to-pink-500"
            accentColor="purple"
          />
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Empowering your healthcare journey with AI</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ServiceCard({ onClick, icon, title, description, features, gradient, accentColor }) {
  const getAccentClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        hover: "hover:border-blue-300",
        feature: "text-blue-600"
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-700", 
        border: "border-indigo-200",
        hover: "hover:border-indigo-300",
        feature: "text-indigo-600"
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200", 
        hover: "hover:border-purple-300",
        feature: "text-purple-600"
      }
    };
    return colors[color];
  };

  const accent = getAccentClasses(accentColor);

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border-2 ${accent.border} ${accent.hover} hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Icon */}
      <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${accent.text}`}>
            {title}
          </h2>
          <ArrowRight className={`w-5 h-5 ${accent.text} group-hover:translate-x-1 transition-transform duration-300`} />
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full`}></div>
              <span className={`text-sm font-medium ${accent.feature}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`mt-6 pt-4 border-t ${accent.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${accent.text}`}>
              Get Started
            </span>
            <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300`}>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}