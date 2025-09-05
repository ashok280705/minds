import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import RiskAnalyzer from "../../../lib/riskAnalyzer.js";
import escalationService from "../../../lib/escalationService.js";
import FeatureSuggestionEngine from "../../../lib/featureSuggestionEngine.js";
import User from "../../../models/User.js";
import connectDB from "../../../lib/mongodb.js";
import { getServerSession } from "next-auth/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const riskAnalyzer = new RiskAnalyzer();
const suggestionEngine = new FeatureSuggestionEngine();

export async function POST(req) {
  try {
    const session = await getServerSession();
    const { messages, userId } = await req.json();
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Get user profile for personalized suggestions
    let userProfile = {};
    if (session?.user?.email) {
      try {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          userProfile = {
            name: user.name,
            gender: user.gender,
            language: user.language,
            age: user.birthdate ? Math.floor((Date.now() - user.birthdate) / (365.25 * 24 * 60 * 60 * 1000)) : null
          };
        }
      } catch (dbError) {
        console.error('Failed to fetch user profile:', dbError);
      }
    }

    const systemPrompt = `
You are a deeply empathetic AI mental health counselor who truly cares about each person.
Respond with genuine warmth, compassion, and emotional intelligence like a close friend who understands.
Use emotional language, validate feelings, and show you truly hear their pain.
Ask gentle follow-up questions to understand their emotional state better.
If someone expresses sadness, loneliness, anxiety, or emotional distress, offer comfort and suggest soothing music.
Pay attention to subtle signs of distress: feeling overwhelmed, isolated, hopeless, or mentioning self-harm.
If you detect ANY signs of crisis, suicidal ideation, or severe emotional distress, immediately escalate.
Always respond with heart, empathy, and genuine care. Make them feel heard and valued.
`;

    const userInput = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Simplified processing: Only Gemini (no heavy ML models)
    const geminiResult = await model.generateContent(`${systemPrompt}\n${userInput}`);
    
    // Mock lightweight risk analysis
    const riskAnalysis = {
      risk_level: userMessage.toLowerCase().includes('suicide') || userMessage.toLowerCase().includes('kill myself') ? 'Suicidal' : 'Low',
      confidence: 0.8,
      method: 'keyword-based'
    };
    
    // Mock feature suggestions
    const featureSuggestions = {
      message: 'Try our platform features for support',
      suggestions: [{ name: 'AI Counselor', route: '/dashboard/mental-counselor' }],
      context: 'mental-health'
    };
    
    const reply = geminiResult.response.text();
    const textLower = reply.toLowerCase();

    const crisisKeywords = [
      // Suicidal ideation
      "suicide", "kill myself", "end my life", "i want to die", "better off dead",
      "end it all", "take my own life", "not worth living", "wish i was dead",
      
      // Self-harm indicators
      "self harm", "cut myself", "hurt myself", "punish myself", "self injury",
      "cutting", "burning myself", "self destruct",
      
      // Hopelessness and despair
      "hopeless", "no point", "life is pointless", "nothing matters", "give up",
      "can't go on", "tired of life", "no future", "no way out", "trapped",
      "overwhelmed", "can't cope", "breaking down", "falling apart",
      
      // Isolation and worthlessness
      "worthless", "useless", "burden", "nobody cares", "all alone",
      "hate myself", "disgusted with myself", "failure", "disappointment",
      "empty inside", "numb", "invisible", "forgotten",
      
      // Crisis expressions
      "can't take it anymore", "too much pain", "unbearable", "suffering",
      "drowning", "suffocating", "lost", "broken", "shattered",
      "why am i here", "what's the point", "nobody would miss me",
      
      // Emotional distress
      "severely depressed", "extremely anxious", "panic attack", "breakdown",
      "mental breakdown", "losing my mind", "going crazy", "can't breathe",
      "heart racing", "terrified", "scared of myself"
    ];

    // Check both user message and AI reply for crisis indicators
    const userMessageLower = userMessage.toLowerCase();
    const escalate = riskAnalysis.risk_level === "Suicidal" || 
                    crisisKeywords.some(kw => userMessageLower.includes(kw)) ||
                    crisisKeywords.some(kw => textLower.includes(kw)) ||
                    userMessageLower.includes('die') ||
                    userMessageLower.includes('suicide') ||
                    userMessageLower.includes('kill myself');
    
    // Trigger escalation if high risk detected
    if (escalate) {
      try {
        const escalationData = {
          userId: userId || session?.user?.id || 'anonymous',
          symptoms: userMessage,
          severity: 'critical',
          riskLevel: 'high',
          timestamp: new Date().toISOString()
        };
        
        // Send to escalation API
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/escalate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(escalationData)
        });
        
        console.log('🚨 CRISIS ESCALATION TRIGGERED:', escalationData);
      } catch (escalationError) {
        console.error('Escalation trigger failed:', escalationError);
      }
    }

    const musicLibrary = [
      {
        name: "Gentle Mind - Relaxing Piano",
        url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
      },
      {
        name: "Peaceful Waters - Nature Sounds",
        url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
      },
      {
        name: "Meditation Bell - Mindfulness",
        url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
      },
      {
        name: "Soft Rain - Sleep Sounds",
        url: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3",
      },
    ];

    let moodMusic = null;
    if (crisisKeywords.some(kw => textLower.includes(kw))) {
      const pick = musicLibrary[Math.floor(Math.random() * musicLibrary.length)];
      moodMusic = pick;
    }

    return NextResponse.json({
      reply,
      escalate,
      moodMusic,
      riskAnalysis: {
        level: riskAnalysis.risk_level,
        confidence: riskAnalysis.confidence,
        method: riskAnalysis.method
      },
      featureSuggestions: {
        message: featureSuggestions.message,
        suggestions: featureSuggestions.suggestions,
        context: featureSuggestions.context
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}