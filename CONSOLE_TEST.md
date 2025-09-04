# 🧞♂️ Console Testing for Genie

## 🚀 Start Website
```bash
cd minds
npm run dev
```

## 🧪 Console Tests

### 1. Test Gemini API
```javascript
// Test in browser console
fetch('/api/genie-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, how are you?' })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Gemini Response:', data);
  if (data.success) {
    console.log('🤖 Genie says:', data.response);
  }
});
```

### 2. Test Text-to-Speech
```javascript
// Test TTS in console
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.volume = 1.0;
  utterance.onstart = () => console.log('🔊 TTS started');
  utterance.onend = () => console.log('🔊 TTS ended');
  speechSynthesis.speak(utterance);
};

speak("Hey! I am Genie. How can I assist you?");
```

### 3. Test Speech-to-Text
```javascript
// Test STT in console
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('🎤 You said:', transcript);
};
recognition.onerror = (e) => console.log('❌ STT Error:', e.error);
recognition.start();
console.log('🎤 Speak now...');
```

### 4. Test Full Genie Flow
```javascript
// Complete test in console
const testGenie = async (query) => {
  console.log('🧞♂️ Testing:', query);
  
  try {
    const response = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success:', data.response);
      
      // Speak the response
      const utterance = new SpeechSynthesisUtterance(data.response);
      speechSynthesis.speak(utterance);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Failed:', error);
  }
};

// Test multiple queries
testGenie('Hello, how are you?');
setTimeout(() => testGenie('I need mental health support'), 3000);
setTimeout(() => testGenie('मुझे डॉक्टर से बात करनी है'), 6000);
```

## 🔍 What to Check

1. **Open browser console** (F12)
2. **Run each test** one by one
3. **Check for:**
   - ✅ API responses
   - 🔊 Audio output
   - 🎤 Voice recognition
   - 🔴 Red dot (top-right corner)

## 🎯 Expected Results

- **Gemini API**: Should return JSON with success:true and response text
- **TTS**: Should hear Genie speaking
- **STT**: Should see transcription in console
- **Status Dot**: Should be red when idle

**Run these console tests and tell me what works!** 🧪