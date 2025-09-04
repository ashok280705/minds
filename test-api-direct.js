// Direct API test
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCUD3MXSMK6Z9Klkt-D1volQBh6MLhzEEM';

async function testGeminiDirect() {
  console.log('🧪 Testing Gemini API directly...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = 'Hello, are you working? Please respond briefly.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Direct API Success:', text);
    return text;
    
  } catch (error) {
    console.error('❌ Direct API Error:', error.message);
    return null;
  }
}

// Test if running in Node.js
if (typeof module !== 'undefined' && module.exports) {
  testGeminiDirect();
}

module.exports = { testGeminiDirect };