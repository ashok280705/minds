"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  Brain, 
  CalendarHeart, 
  Users, 
  MessageSquare, 
  Lock, 
  Home,
  FileText,
  Pill,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Activity,
  Shield,
  Scan,
  FileUser,
  AlertTriangle,
  Stethoscope,
  Phone,
  MapPin,
  Thermometer,
  Clock,
  UserCheck,
  ScanLine,
  Droplets
} from "lucide-react";

export default function ModernSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userGender, setUserGender] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

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
      setUserProfile(data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const mainLinks = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: Home,
      description: "Overview & Quick Access"
    },
    { 
      href: "/dashboard/mental-counselor", 
      label: "Mental Health Counsellor", 
      icon: Brain,
      description: "Chat with AI Assistant"
    },

    { 
      href: "/dashboard/mental-counselor/period-tracker", 
      label: "Period Tracker", 
      icon: CalendarHeart,
      description: "Menstrual Health Tracking",
      locked: userGender !== "female"
    },
    { 
      href: "/dashboard/reports-analyzer", 
      label: "Reports Analyzer", 
      icon: FileText,
      description: "Medical Report Analysis"
    },
    { 
      href: "/personal-documents", 
      label: "Personal Documents", 
      icon: FileUser,
      description: "Manage Your Documents"
    },
    { 
      href: "/dashboard/pharmacy", 
      label: "Pharmacy", 
      icon: Pill,
      description: "Medicine & Prescriptions",
      dropdown: [
        { href: "/dashboard/pharmacy/online", label: "Online Pharmacy" },
        { href: "/dashboard/pharmacy/physical", label: "Nearby Pharmacies" }
      ]
    },
    { 
      href: "/dashboard/prescription-reader", 
      label: "Prescription Reader", 
      icon: Scan,
      description: "Scan & Analyze Prescriptions"
    },
    { 
      href: "/dashboard/emergency-sos", 
      label: "Emergency SOS", 
      icon: AlertTriangle,
      description: "Accident & Crisis Support"
    },
    { 
      href: "/dashboard/routine-doctor", 
      label: "Routine Doctor", 
      icon: Phone,
      description: "Virtual Doctor Consultations"
    },
    { 
      href: "/dashboard/nearby-services", 
      label: "Nearby Services", 
      icon: MapPin,
      description: "Hospitals & Ambulance",
      dropdown: [
        { href: "/dashboard/nearby-services", label: "Nearby Hospitals" },
        { href: "/dashboard/blood-bank", label: "Find Blood Banks" }
      ]
    },
    { 
      href: "/dashboard/blood-bank", 
      label: "Blood Bank Services", 
      icon: Droplets,
      description: "Blood Donation & Medicine Tracking",
      dropdown: [
        { href: "/dashboard/blood-bank", label: "Blood Bank" },
        { href: "/dashboard/blood-bank/medicines", label: "My Medicines" }
      ]
    },
    { 
      href: "/dashboard/scans-analyzer", 
      label: "Scans Analyzer", 
      icon: ScanLine,
      description: "Medical Scan Analysis",
      dropdown: [
        { href: "/dashboard/scans-analyzer/mri", label: "MRI Scans" },
        { href: "/dashboard/scans-analyzer/xray", label: "X-Ray" },
        { href: "/dashboard/scans-analyzer/chest", label: "Chest Scan" },
        { href: "/dashboard/scans-analyzer/kidney", label: "Kidney Scan" },
        { href: "/dashboard/scans-analyzer/heart", label: "Heart Scan" },
        { href: "/dashboard/scans-analyzer/skin", label: "Skin Analysis" },
        { href: "/dashboard/scans-analyzer/liver", label: "Liver Scan" }
      ]
    }
  ];

  const bottomLinks = [
    { 
      href: "/profile", 
      label: "Profile", 
      icon: User,
      description: "Account Settings"
    }
  ];

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
            <Brain className="text-white w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                Minds
              </h1>
              <p className="text-xs text-gray-500">Mental Wellness Platform</p>
            </div>
          )}
        </div>
      </div>



      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[10px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className={`${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
          )}
          
          {mainLinks.map(({ href, label, icon: Icon, description, locked, dropdown }) => {
            const isActive = pathname === href;
            
            if (locked) {
              return (
                <div
                  key={href}
                  className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-gray-400 cursor-not-allowed`}
                  title={isCollapsed ? `${label} - Available for female users only` : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-gray-400">{description}</p>
                      </div>
                      <Lock className="w-4 h-4" />
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {label} - Female users only
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <div key={href} className="space-y-1">
                {dropdown ? (
                  <div
                    onClick={() => setExpandedItem(expandedItem === href ? null : href)}
                    className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1">
                        <p className="font-medium">{label}</p>
                        <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {description}
                        </p>
                      </div>
                    )}
                    {!isCollapsed && (
                      <div className={`transform transition-transform ${expandedItem === href ? 'rotate-90' : ''}`}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={href}
                    className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1">
                        <p className="font-medium">{label}</p>
                        <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {description}
                        </p>
                      </div>
                    )}
                  </Link>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
                
                {/* Sub-menu items */}
                {dropdown && expandedItem === href && !isCollapsed && (
                  <div className="ml-8 space-y-1">
                    {dropdown.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2 mt-auto">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h3>
        )}
        
        {bottomLinks.map(({ href, label, icon: Icon, description }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="font-medium">{label}</p>
                  <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {description}
                  </p>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={`group relative w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <p className="font-medium">Sign Out</p>
              <p className="text-xs text-red-400">End your session</p>
            </div>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}