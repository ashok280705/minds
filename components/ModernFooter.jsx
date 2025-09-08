"use client";

import Link from "next/link";
import { 
  Shield, 
  Brain,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

export default function ModernFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Linkedin, label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Main Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand & Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Clarity Care
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>© {currentYear}</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                className="w-7 h-7 bg-gray-700 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-4 p-2 bg-red-900/20 border border-red-800/30 rounded-lg">
          <p className="text-red-300 text-xs text-center">
            <strong>Emergency:</strong> Mental health crisis? Call 988 immediately
          </p>
        </div>
      </div>
    </footer>
  );
}