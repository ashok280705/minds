import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import FeatureSuggestionEngine from '../../../lib/featureSuggestionEngine.js';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const suggestionEngine = new FeatureSuggestionEngine();

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    // Detect language of the message
    const isHindi = /[\u0900-\u097F]/.test(message);
    const isMarathi = /[\u0900-\u097F]/.test(message) && (message.includes('आहे') || message.includes('का') || message.includes('ते'));
    
    let responseLanguage = 'English';
    if (isHindi) responseLanguage = 'Hindi';
    if (isMarathi) responseLanguage = 'Marathi';
    
    // Get intelligent feature suggestions
    const featureSuggestions = await suggestionEngine.processUserInput(message);
    const topFeature = featureSuggestions.suggestions[0];
    
    // Complete Minds platform training
    const prompt = `You are Genie, the AI assistant for MINDS - our comprehensive mental health and wellness platform.

    User said: "${message}"
    
    RESPONSE FORMAT:
    1. Give helpful tips/advice for their concern
    2. Then suggest our website feature using: "You can use [FEATURE NAME] on our website" or "Try our [FEATURE NAME] on our platform"
    
    OUR WEBSITE FEATURES:
    - Period Tracker: "You can use Period Tracker on our website to monitor your menstrual health"
    - AI Counselor: "Try our AI Counselor on our platform for 24/7 emotional support"
    - Reports Analyzer: "You can use Reports Analyzer on our website to analyze your medical reports"
    - Online Pharmacy: "Try our Online Pharmacy on our platform to order medicines"
    - Telemedicine: "You can use Telemedicine on our website to consult doctors virtually"
    - Health Monitor: "Try our Health Monitor on our platform to track your symptoms"
    - Emergency SOS: "You can use Emergency SOS on our website for immediate help"
    - Scans Analyzer: "Try our Scans Analyzer on our platform for medical imaging analysis"
    
    EXAMPLES:
    User: "My periods are irregular"
    Response: "Irregular periods can be due to stress or hormonal changes. You can use Period Tracker on our website to monitor your cycle and get personalized insights."
    
    Always say "our website" or "our platform" when mentioning features. Respond in ${responseLanguage}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
      language: responseLanguage,
      suggestedFeature: topFeature ? {
        name: topFeature.name,
        route: topFeature.route,
        reason: topFeature.relevanceReason
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Genie Chat Error:', error);
    
    // Handle specific Gemini API errors
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key issue. Please check configuration.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Model not available. Using fallback response.';
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message,
      fallbackResponse: 'Hello! I am Genie, your AI assistant. How can I help you today?'
    }, { status: 500 });
  }
}