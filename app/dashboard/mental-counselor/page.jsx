"use client";

import ChatBot from "@/components/ChatBot";

export default function MentalCounselorPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-800 mb-4">Your AI Mental Counselor</h1>
      <ChatBot />
    </div>
  );
}