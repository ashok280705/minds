"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import PeriodNotifications from "@/components/PeriodNotifications";

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
    pathname.startsWith("/video-room");

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
    </div>
  );
}