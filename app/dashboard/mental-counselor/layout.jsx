"use client";

import ModernSidebar from "@/components/ModernSidebar";

export default function MentalCounselorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}