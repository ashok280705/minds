"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserNavbar from "@/components/UserNavbar";
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
    // SSR safe fallback (optional)
    return <main>{children}</main>;
  }

  const hideLayout =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/doctor/register" ||
    pathname === "/doctor-register" ||
    pathname === "/doctor" ||
    pathname.startsWith("/chat-room")||pathname.startsWith("/video-room");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900">
      {!hideLayout && (
        <header className="sticky top-0 z-50 shadow bg-white">
          <UserNavbar />
        </header>
      )}

      <main className="flex-1 w-full">{children}</main>

      {!hideLayout && (
        <footer className="bg-white shadow-inner ">
          <Footer />
        </footer>
      )}
      
      {/* Period Notifications for Female Users */}
      {!hideLayout && userGender === "female" && <PeriodNotifications />}
    </div>
  );
}