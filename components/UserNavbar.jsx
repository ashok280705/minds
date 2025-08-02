"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function UserNavbar() {
  const { data: session } = useSession();
  const HandelLogout=()=>{
    signOut({callbackUrl:"/auth/login"})
  } 
  return (
    <nav className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-lg border-b border-emerald-100/50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link 
            href="/dashboard" 
            className="group flex items-center space-x-3 text-2xl font-bold text-emerald-800 hover:text-emerald-600 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white text-lg">🧠</span>
            </div>
            <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Minds
            </span>
            <span className="text-sm font-medium text-emerald-600/70 hidden sm:block">
              Mental Wellness
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <div className="hidden md:flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-full px-2 py-1 shadow-md border border-white/20">
              <NavLink href="/dashboard/mental-counselor" icon="💬">
                Mental Counselor
              </NavLink>
              <NavLink href="/dashboard/report-analyzer" icon="📊">
                Report Analyzer
              </NavLink>
              <NavLink href="/dashboard/pharmacy" icon="💊">
                Pharmacy
              </NavLink>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center ml-4 space-x-3">
              {session?.user && (
                <div className="hidden sm:flex items-center space-x-2 text-emerald-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-semibold">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {session.user.name || 'User'}
                  </span>
                </div>
              )}
              
              <button
                onClick={HandelLogout}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                <span className="flex items-center space-x-2">
                  <span>Logout</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-emerald-100">
          <div className="flex flex-wrap gap-2">
            <MobileNavLink href="/dashboard/mental-counselor" icon="💬">
              Counselor
            </MobileNavLink>
            <MobileNavLink href="/dashboard/report-analyzer" icon="📊">
              Reports
            </MobileNavLink>
            <MobileNavLink href="/dashboard/pharmacy" icon="💊">
              Pharmacy
            </MobileNavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, children, icon }) {
  return (
    <Link
      href={href}
      className="group flex items-center space-x-2 px-4 py-2 text-emerald-700 hover:text-emerald-900 hover:bg-white/80 rounded-full transition-all duration-300 text-sm font-medium relative overflow-hidden"
    >
      <span className="text-base">{icon}</span>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, children, icon }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm text-emerald-700 hover:text-emerald-900 hover:bg-white rounded-full transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
    >
      <span className="text-sm">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}