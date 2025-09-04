// Test Genie API directly
const testGenie = async () => {
  console.log('🧪 Testing Genie API...');
  
  const testQueries = [
    "Hello, how are you?",
    "I need mental health support",
    "मुझे डॉक्टर से बात करनी है",
    "What features does this platform have?"
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Testing query: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/genie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Success!');
        console.log('🤖 Genie Response:', data.response);
        console.log('🌐 Language:', data.language);
      } else {
        console.log('❌ Error:', data.error);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
};

// Test TTS
const testTTS = () => {
  console.log('\n🔊 Testing Text-to-Speech...');
  
  if ('speechSynthesis' in window || typeof window !== 'undefined') {
    console.log('✅ TTS supported');
    
    // Test in browser console
    const testText = "Hello! I am Genie. How can I assist you?";
    console.log('🗣️ Test this in browser console:');
    console.log(`
const utterance = new SpeechSynthesisUtterance("${testText}");
utterance.rate = 0.9;
utterance.volume = 1.0;
speechSynthesis.speak(utterance);
    `);
  } else {
    console.log('❌ TTS not supported');
  }
};

// Test STT
const testSTT = () => {
  console.log('\n🎤 Testing Speech-to-Text...');
  
  if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.log('✅ STT supported');
    console.log('🗣️ Test this in browser console:');
    console.log(`
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.onresult = (event) => {
  console.log('You said:', event.results[0][0].transcript);
};
recognition.start();
// Then speak into microphone
    `);
  } else {
    console.log('❌ STT not supported');
  }
};

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  testGenie();
} else {
  // Browser environment
  console.log('🧞♂️ Genie Test Suite');
  testTTS();
  testSTT();
  testGenie();
}

module.exports = { testGenie, testTTS, testSTT };