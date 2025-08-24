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
    router.push("/pharmacy");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-10 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-3xl">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
              <Brain className="text-white w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-emerald-800">Welcome to </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Minds
            </span>
          </h1>
          
          <p className="text-lg text-emerald-700/80 font-medium mb-6">
            Your comprehensive mental wellness companion
          </p>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-emerald-600/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Professional Care</span>
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
            title="Mental Counselor"
            description="Connect with your AI mental health companion for personalized support, mood-based music therapy, and crisis intervention with real doctor consultations."
            features={["AI Companion", "Mood Analysis", "Crisis Detection", "Music Therapy"]}
            gradient="from-emerald-400 to-teal-500"
            accentColor="emerald"
          />

          {/* Reports Analyzer Card */}
          <ServiceCard
            onClick={handleReportsClick}
            icon={<FileText className="w-8 h-8" />}
            title="Reports Analyzer"
            description="Upload and analyze your medical reports with AI-powered insights. Get clear understanding of your health trends and recommendations."
            features={["AI Analysis", "Health Trends", "Report Insights", "Progress Tracking"]}
            gradient="from-teal-400 to-cyan-500"
            accentColor="teal"
          />

          {/* Pharmacy Card */}
          <ServiceCard
            onClick={handlePharmacyClick}
            icon={<Pill className="w-8 h-8" />}
            title="Pharmacy"
            description="Order trusted medications at affordable prices with convenient doorstep delivery and prescription management."
            features={["Trusted Medicines", "Affordable Prices", "Home Delivery", "Prescription Tracking"]}
            gradient="from-cyan-400 to-blue-500"
            accentColor="cyan"
          />
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Empowering your journey to mental wellness</span>
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
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        hover: "hover:border-emerald-300",
        feature: "text-emerald-600"
      },
      teal: {
        bg: "bg-teal-50",
        text: "text-teal-700", 
        border: "border-teal-200",
        hover: "hover:border-teal-300",
        feature: "text-teal-600"
      },
      cyan: {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200", 
        hover: "hover:border-cyan-300",
        feature: "text-cyan-600"
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