"use client";

import { usePathname } from "next/navigation";
import ModernSidebar from "@/components/ModernSidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  
  // Don't show sidebar for mental counselor pages as they have their own layout
  const hideSidebar = pathname.startsWith("/dashboard/mental-counselor");
  
  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}