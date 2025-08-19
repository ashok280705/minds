"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Brain, CalendarHeart, Users, MessageSquare, Lock } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
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

  const links = [
    { href: "/dashboard/mental-counselor", label: "AI Counselor", icon: Brain },
    { href: "/dashboard/mental-counselor/chat-history", label: "Chat History", icon: MessageSquare },
    { 
      href: "/dashboard/mental-counselor/period-tracker", 
      label: "Period Tracker", 
      icon: CalendarHeart,
      locked: userGender !== "female"
    },
    { href: "/dashboard/mental-counselor/community", label: "Community", icon: Users },
  ];

  return (
    <aside className="w-60 min-h-screen bg-emerald-50 border-r border-emerald-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-emerald-700">Mental Wellness</h2>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon, locked }) => {
          if (locked) {
            return (
              <div
                key={href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 cursor-not-allowed relative"
                title="Available for female users only"
              >
                <Icon className="w-5 h-5" />
                {label}
                <Lock className="w-4 h-4 ml-auto" />
              </div>
            );
          }
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === href
                  ? "bg-emerald-100 text-emerald-800 font-semibold"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}