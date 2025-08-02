"use client";
import { LogOut, Activity, Stethoscope } from "lucide-react";

export default function DoctorNavbar({ status, doctorName, onLogout }) {
  return (
    <nav className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-lg border-b border-emerald-100/50">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
              <p className="text-xs text-emerald-600/70 font-medium">
                Mental Health Professional Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/20">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${
                  status === "online"
                    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    : "bg-red-400 shadow-lg shadow-red-400/50"
                }`}></div>
                {status === "online" && (
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
              <span className={`capitalize text-sm font-medium ${
                status === "online" ? "text-emerald-700" : "text-red-700"
              }`}>
                {status}
              </span>
              <Activity className={`w-4 h-4 ${
                status === "online" ? "text-emerald-600" : "text-red-600"
              }`} />
            </div>

            {doctorName && (
              <div className="hidden sm:flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-semibold">Dr</span>
                </div>
                <div className="text-emerald-700">
                  <p className="text-sm font-medium">{doctorName}</p>
                  <p className="text-xs text-emerald-600/70">Licensed Therapist</p>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <span className="flex items-center space-x-2">
                <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="hidden sm:block">Logout</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}