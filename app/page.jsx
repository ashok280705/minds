"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const ctaButtonsRef = useRef(null);
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);
  const shape3Ref = useRef(null);

  useEffect(() => {
    // Simple animation using CSS transitions and setTimeout
    const animateOnLoad = () => {
      // Animate hero content
      setTimeout(() => {
        if (heroTitleRef.current) {
          heroTitleRef.current.style.opacity = '1';
          heroTitleRef.current.style.transform = 'translateY(0)';
        }
      }, 300);

      setTimeout(() => {
        if (heroSubtitleRef.current) {
          heroSubtitleRef.current.style.opacity = '1';
          heroSubtitleRef.current.style.transform = 'translateY(0)';
        }
      }, 600);

      setTimeout(() => {
        if (ctaButtonsRef.current) {
          ctaButtonsRef.current.style.opacity = '1';
          ctaButtonsRef.current.style.transform = 'translateY(0)';
        }
      }, 900);
    };

    animateOnLoad();

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements when they come into view
    const observeElements = document.querySelectorAll('.animate-on-scroll');
    observeElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white overflow-hidden relative">
      <style jsx>{`
        .floating-shape {
          animation: float 20s ease-in-out infinite;
        }
        .floating-shape:nth-child(2) {
          animation-delay: -5s;
          animation-duration: 25s;
        }
        .floating-shape:nth-child(3) {
          animation-delay: -10s;
          animation-duration: 15s;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, -10px) rotate(270deg); }
        }
        
        .animate-fade-in {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s ease-out;
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s ease-out;
        }
        
        .btn-hover:hover {
          transform: translateY(-3px);
        }
        
        .card-hover:hover {
          transform: translateY(-10px);
        }
      `}</style>

      {/* Floating background shapes */}
      <div 
        ref={shape1Ref}
        className="floating-shape absolute w-72 h-72 bg-pink-400 rounded-full filter blur-3xl opacity-20 top-20 left-20"
      />
      <div 
        ref={shape2Ref}
        className="floating-shape absolute w-64 h-64 bg-indigo-400 rounded-full filter blur-3xl opacity-10 bottom-20 right-20"
      />
      <div 
        ref={shape3Ref}
        className="floating-shape absolute w-48 h-48 bg-purple-400 rounded-full filter blur-3xl opacity-15 bottom-32 left-10"
      />

      {/* Header */}
      <header className="fixed top-0 w-full px-8 py-4 bg-white/95 backdrop-blur-md shadow-lg z-50">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-2xl font-bold text-indigo-600">MindCare</div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Home</a>
            <a href="#services" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Services</a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 
            ref={heroTitleRef}
            className="animate-fade-in text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Your Safe Space for Mental Wellness
          </h1>
          
          <p 
            ref={heroSubtitleRef}
            className="animate-fade-in text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed"
          >
            Connect with compassionate AI mental health support or professional counselors. 
            Take the first step towards better mental health today.
          </p>
          
          <div 
            ref={ctaButtonsRef}
            className="animate-fade-in flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <Link href="/dashboard/mental-counselor/details">
              <button className="btn-hover px-8 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-xl hover:bg-indigo-50 transition-all duration-300 transform">
                Start Conversation
              </button>
            </Link>
            
            <Link href="/doctor/dashboard">
              <button className="btn-hover px-8 py-4 bg-white/10 text-white font-bold rounded-full border-2 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform">
                Find a Counselor
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white/95 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="animate-on-scroll text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">
            How We Support You
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💬",
                title: "24/7 AI Support",
                description: "Get immediate emotional support and guidance anytime you need it with our compassionate AI companion."
              },
              {
                icon: "👩‍⚕️",
                title: "Licensed Professionals",
                description: "Connect with certified mental health professionals for deeper therapeutic support and counseling."
              },
              {
                icon: "🔒",
                title: "Complete Privacy",
                description: "Your conversations are completely confidential and secure. We prioritize your privacy above all else."
              },
              {
                icon: "📱",
                title: "Accessible Anywhere",
                description: "Access support from any device, anywhere. Mental health care should never be out of reach."
              },
              {
                icon: "🌱",
                title: "Personal Growth",
                description: "Develop coping strategies, build resilience, and work towards your mental wellness goals."
              },
              {
                icon: "💝",
                title: "Compassionate Care",
                description: "Experience judgment-free support in a safe environment designed for healing and growth."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="animate-on-scroll card-hover bg-white p-8 rounded-2xl shadow-xl text-center transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="animate-on-scroll text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="animate-on-scroll text-xl mb-8 opacity-90 leading-relaxed">
            Take the first step towards better mental health. You don't have to face your challenges alone.
          </p>
          <Link href="/auth/login">
            <button className="animate-on-scroll btn-hover px-10 py-5 bg-white text-indigo-700 font-bold rounded-full shadow-xl hover:bg-indigo-50 transition-all duration-300 transform text-lg">
              Get Started Today
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 text-center text-white/70 relative z-10">
        <p>&copy; {new Date().getFullYear()} MindCare. Your mental health matters. All rights reserved.</p>
      </footer>
    </div>
  );
}