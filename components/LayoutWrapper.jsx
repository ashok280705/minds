"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import PeriodNotifications from "@/components/PeriodNotifications";
import Sidebar from "@/components/ModernSidebar";
import VapiGenie from "@/components/VapiGenie";
export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [userGender, setUserGender] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email && mounted) {
      fetchUserProfile();
    }
  }, [session, mounted]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setUserGender(data.user?.gender);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  if (!mounted) {
    return <main>{children}</main>;
  }

  const hideLayout =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/doctor/register" ||
    pathname === "/doctor-register" ||
    pathname.startsWith("/chat-room") ||
    pathname.startsWith("/video-room") ||
    pathname.startsWith("/doctor");

  const showSidebar = !hideLayout && session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {!hideLayout && (
        <header className="sticky top-0 z-50">
          <ModernNavbar />
        </header>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}
        
        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? 'ml-0' : 'w-full'} min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {!hideLayout && (
        <footer className="bg-white shadow-inner border-t border-blue-100">
          <Footer />
        </footer>
      )}
      
      {/* Period Notifications for Female Users */}
      {!hideLayout && userGender === "female" && <PeriodNotifications />}
      
      {/* Hey Genie Voice Assistant */}
      {!hideLayout && <VapiGenie />}
      
      {/* Genie Test Script */}
      {!hideLayout && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Console test functions for Genie
              window.testGenieAPI = async (query = "Hello, how are you?") => {
                console.log('🧪 Testing Gemini API...');
                try {
                  const response = await fetch('/api/genie-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: query })
                  });
                  const data = await response.json();
                  console.log('✅ API Response:', data);
                  return data;
                } catch (error) {
                  console.error('❌ API Error:', error);
                }
              };
              
              window.testTTS = (text = "Hey! I am Genie. How can I assist you?") => {
                console.log('🔊 Testing TTS...');
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onstart = () => console.log('🔊 TTS Started');
                utterance.onend = () => console.log('🔊 TTS Ended');
                speechSynthesis.speak(utterance);
              };
              
              console.log('🧞♂️ Genie test functions loaded!');
              console.log('Try: testGenieAPI("your question") or testTTS("hello")');
              
              // Gemini direct test
              window.testGeminiDirect = async (prompt = "Hello, how are you?") => {
                console.log('🧪 Testing Gemini:', prompt);
                try {
                  const response = await fetch('/api/genie-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                  });
                  const data = await response.json();
                  console.log('📊 Gemini Response:', data);
                  if (data.success) {
                    const utterance = new SpeechSynthesisUtterance(data.response);
                    speechSynthesis.speak(utterance);
                  }
                  return data;
                } catch (error) {
                  console.error('❌ Gemini Error:', error);
                }
              };
              
              // Auto-test Gemini
              setTimeout(() => testGeminiDirect('Hello Genie, test response'), 3000);
            `
          }}
        />
      )}
    </div>
  );
}