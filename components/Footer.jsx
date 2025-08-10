import { Brain, Heart, Shield, Phone, Mail, MapPin, Clock, Star, CheckCircle, Globe } from "lucide-react";

export default function MentalCounselorFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t border-emerald-100/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Minds
                </h3>
                <p className="text-xs text-emerald-600/70 font-medium">
                  Mental Wellness Platform
                </p>
              </div>
            </div>
            
            <p className="text-emerald-700/80 text-sm leading-relaxed mb-6">
              Empowering your journey to mental wellness with AI-powered support, professional care, and personalized treatment plans.
            </p>
            
            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-emerald-600/70 text-sm">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600/70 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600/70 text-sm">
                <Heart className="w-4 h-4" />
                <span>Evidence-Based Care</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Our Services
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/mental-counselor" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                  AI Mental Health Companion
                </a>
              </li>
              <li>
                <a href="/report-analyzer" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-teal-400 rounded-full group-hover:bg-teal-500 transition-colors"></div>
                  Health Report Analysis
                </a>
              </li>
              <li>
                <a href="/pharmacy" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:bg-cyan-500 transition-colors"></div>
                  Online Pharmacy
                </a>
              </li>
              <li>
                <a href="/crisis-support" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-red-400 rounded-full group-hover:bg-red-500 transition-colors"></div>
                  Crisis Intervention
                </a>
              </li>
              <li>
                <a href="/music-therapy" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                  Music Therapy
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Support & Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/help" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/faq" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-teal-400 rounded-full group-hover:bg-teal-500 transition-colors"></div>
                  FAQ
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:bg-cyan-500 transition-colors"></div>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-emerald-700/70 hover:text-emerald-800 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Emergency Section */}
          <div>
            <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Contact & Emergency
            </h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-emerald-700/70 text-sm">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-MIND</span>
              </div>
              <div className="flex items-center space-x-3 text-emerald-700/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@minds.care</span>
              </div>
              <div className="flex items-center space-x-3 text-emerald-700/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>24/7 Crisis Support</span>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium mb-2">
                🚨 Mental Health Emergency?
              </p>
              <p className="text-red-600 text-xs mb-2">
                If you're having thoughts of self-harm, please contact:
              </p>
              <div className="space-y-1 text-xs">
                <p className="text-red-700 font-semibold">• 988 - Suicide & Crisis Lifeline</p>
                <p className="text-red-700 font-semibold">• 911 - Emergency Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-emerald-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700 mb-1">10K+</div>
            <div className="text-emerald-600/70 text-sm">Lives Supported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700 mb-1">50+</div>
            <div className="text-emerald-600/70 text-sm">Licensed Therapists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700 mb-1">99.9%</div>
            <div className="text-emerald-600/70 text-sm">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700 mb-1">4.9★</div>
            <div className="text-emerald-600/70 text-sm">User Rating</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-emerald-600/70 text-sm">
            © {new Date().getFullYear()} Minds Mental Wellness Platform. All rights reserved.
          </div>

          {/* Language & Social */}
          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="flex items-center space-x-2 text-emerald-600/70 text-sm">
              <Globe className="w-4 h-4" />
              <select className="bg-transparent border-none text-emerald-700 text-sm focus:outline-none">
                <option>English</option>
                <option>हिंदी</option>
                <option>मराठी</option>
              </select>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a href="#" className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
                <span className="text-emerald-700 text-sm">f</span>
              </a>
              <a href="#" className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
                <span className="text-emerald-700 text-sm">t</span>
              </a>
              <a href="#" className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
                <span className="text-emerald-700 text-sm">in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Final Accent Line */}
        <div className="mt-8">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-60"></div>
        </div>
      </div>
    </footer>
  );
}