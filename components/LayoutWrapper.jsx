"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR safe fallback (optional)
    return <main>{children}</main>;
  }

  const hideLayout =
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/doctor/register" ||
    pathname === "/doctor-register"||pathname === "/doctor" ;

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
    </div>
  );
}