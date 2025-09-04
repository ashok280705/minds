# 🧞♂️ Genie Testing Guide

## 🧪 Test Components Added

### 1. GenieDebugger Component
- **Location**: Bottom-left corner of website
- **Visual testing panel** with buttons and logs
- **Real-time feedback** for all Genie functions

### 2. Test Buttons Available:
- **Test STT**: Click to start speech recognition
- **Test Wake Word**: Simulates "Hey Genie" trigger
- **Test Queries**: Runs multiple test questions
- **Test TTS**: Speaks sample text

## 🎯 Testing Steps

### Step 1: Start the Website
```bash
cd minds
npm run dev
```

### Step 2: Look for Components
- **Red dot** (top-right): Genie status indicator
- **Debug panel** (bottom-left): Testing interface

### Step 3: Test Each Function

#### A) Test TTS (Text-to-Speech)
1. Click **"Test TTS"** button
2. Should hear: "Hello! I am Genie. How can I assist you?"
3. Check logs for TTS events

#### B) Test Gemini API
1. Click **"Test Wake Word"** button
2. Should see API request/response in logs
3. Should hear Genie's voice response

#### C) Test STT (Speech-to-Text)
1. Click **"Test STT"** button
2. Speak into microphone when prompted
3. Should see transcription in logs

#### D) Test Full Flow
1. Click **"Test Queries"** button
2. Watches automated test of multiple queries
3. Each should get Gemini response + TTS

## 🔍 What to Check

### Status Indicators:
- 🔴 **Red dot**: Genie off/waiting for wake word
- 🟢 **Green dot**: Genie listening to user
- 🟡 **Yellow dot**: Genie processing request

### Debug Logs Should Show:
```
[Time] 🧞♂️ Genie Debugger initialized
[Time] ✅ Speech Recognition supported  
[Time] ✅ Speech Synthesis supported
[Time] 🔊 Available voices: X
[Time] 🧠 Testing Genie API with: "query"
[Time] ✅ Genie API success
[Time] 🤖 Response: "Genie's answer"
[Time] 🔊 TTS started
[Time] 🔊 TTS ended
```

## 🚨 Troubleshooting

### If No Audio:
- Check browser audio permissions
- Try different browser (Chrome recommended)
- Check system volume

### If No STT:
- Grant microphone permissions
- Check microphone is working
- Try HTTPS (some browsers require it)

### If API Fails:
- Check Gemini API key in .env.local
- Check network connection
- Look for error messages in logs

## ✅ Success Criteria

**Genie is working if:**
1. ✅ TTS speaks responses clearly
2. ✅ STT transcribes speech accurately  
3. ✅ Gemini API returns relevant responses
4. ✅ Status dot changes colors appropriately
5. ✅ Debug logs show all events

**Test this and let me know which parts work/fail!** 🧪