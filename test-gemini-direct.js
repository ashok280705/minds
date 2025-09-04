// Test Gemini API directly in console
window.testGeminiDirect = async (prompt = "Hello, how are you? Please give me a helpful response.") => {
  console.log('🧪 Testing Gemini API with prompt:', prompt);
  
  try {
    const response = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    
    const data = await response.json();
    console.log('📊 Full API Response:', data);
    
    if (data.success) {
      console.log('✅ Gemini Response:', data.response);
      console.log('🌐 Language:', data.language);
      
      // Test TTS with response
      const utterance = new SpeechSynthesisUtterance(data.response);
      utterance.onstart = () => console.log('🔊 TTS Started');
      utterance.onend = () => console.log('🔊 TTS Ended');
      speechSynthesis.speak(utterance);
      
      return data.response;
    } else {
      console.error('❌ API Error:', data.error);
      console.error('Details:', data.details);
      return null;
    }
  } catch (error) {
    console.error('❌ Request Error:', error);
    return null;
  }
};

// Auto-test on load
console.log('🧞♂️ Gemini test function loaded!');
console.log('Try: testGeminiDirect("What is the weather like?")');

// Test immediately
setTimeout(() => {
  testGeminiDirect("Hello Genie, can you help me with health advice?");
}, 2000);