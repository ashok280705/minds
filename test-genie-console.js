// Console test script for Genie
console.log('🧞♂️ Genie Test Script Loaded');

// Test 1: Gemini API
window.testGenieAPI = async (query = "Hello, how are you?") => {
  console.log('🧪 Testing Gemini API...');
  try {
    const response = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query })
    });
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
  }
};

// Test 2: Text-to-Speech
window.testTTS = (text = "Hey! I am Genie. How can I assist you?") => {
  console.log('🔊 Testing TTS...');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.volume = 1.0;
  utterance.onstart = () => console.log('🔊 TTS Started');
  utterance.onend = () => console.log('🔊 TTS Ended');
  utterance.onerror = (e) => console.error('🔊 TTS Error:', e);
  speechSynthesis.speak(utterance);
};

// Test 3: Speech-to-Text
window.testSTT = () => {
  console.log('🎤 Testing STT...');
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 You said:', transcript);
    };
    recognition.onerror = (e) => console.error('🎤 STT Error:', e.error);
    recognition.onstart = () => console.log('🎤 STT Started - Speak now!');
    recognition.onend = () => console.log('🎤 STT Ended');
    recognition.start();
  } else {
    console.error('❌ STT not supported');
  }
};

// Test 4: Full Genie Flow
window.testFullGenie = async (query = "I need mental health support") => {
  console.log('🧞♂️ Testing Full Genie Flow...');
  try {
    // 1. Test API
    const data = await testGenieAPI(query);
    if (data && data.success) {
      // 2. Test TTS with response
      testTTS(data.response);
      console.log('✅ Full flow completed successfully!');
    }
  } catch (error) {
    console.error('❌ Full flow error:', error);
  }
};

// Test 5: Wake Word Simulation
window.simulateWakeWord = () => {
  console.log('🧞♂️ Simulating wake word detection...');
  // Trigger the activation manually
  const event = new CustomEvent('wakeWordDetected');
  window.dispatchEvent(event);
};

// Auto-run basic tests
console.log('🚀 Running basic tests...');
console.log('Available test functions:');
console.log('- testGenieAPI("your question")');
console.log('- testTTS("text to speak")');
console.log('- testSTT()');
console.log('- testFullGenie("your question")');

// Test if APIs are working
setTimeout(() => {
  console.log('🧪 Auto-testing Gemini API...');
  testGenieAPI('Hello Genie, are you working?');
}, 2000);