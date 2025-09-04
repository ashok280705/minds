# 🧞♂️ Hey Genie Wake Word Setup Guide

## Step 1: Get Picovoice Access Key

1. Go to [Picovoice Console](https://console.picovoice.ai/)
2. Create a free account
3. Copy your Access Key from the dashboard

## Step 2: Test Built-in Wake Word

```bash
cd porcupine/demo/python
python3 demo.py --access_key YOUR_ACCESS_KEY_HERE --keyword picovoice
```

Say "Picovoice" and it should detect it instantly!

## Step 3: Create Custom "Hey Genie" Wake Word

1. In [Picovoice Console](https://console.picovoice.ai/):
   - Go to "Wake Word" section
   - Click "Train Wake Word"
   - Enter phrase: "Hey Genie"
   - Follow the training process (record samples)
   - Download the `.ppn` file

2. Test your custom wake word:
```bash
python3 demo.py --access_key YOUR_ACCESS_KEY_HERE --keyword_path /path/to/hey_genie.ppn
```

## Step 4: Integrate with Your Website

### Option A: Web Integration (Recommended)
- Use the `web_integration_example.html` file as a template
- Replace `YOUR_ACCESS_KEY_HERE` with your actual access key
- Upload your `hey_genie.ppn` file to your web server
- Update the file path in the JavaScript code

### Option B: Backend Integration
- Use Python/Node.js backend with Porcupine
- Stream audio from frontend to backend
- Process wake word detection on server

## Available Built-in Keywords for Testing:
- alexa, americano, blueberry, bumblebee, computer
- grapefruit, grasshopper, hey barista, hey google, hey siri
- jarvis, ok google, pico clock, picovoice, porcupine, terminator

## Integration with Your AI Assistant

Once "Hey Genie" is detected:
1. Start recording user's voice
2. Send audio to your AI backend (Gemini API)
3. Process the response
4. Play back or display the AI response

## Next Steps for Your Website:
1. Add wake word detection to your existing React/Next.js app
2. Connect it to your Gemini AI backend
3. Implement voice recording and playback
4. Add visual feedback when Genie is activated

## Files Created:
- `demo.py` - Simple test script
- `web_integration_example.html` - Web integration template
- This setup guide

## Troubleshooting:
- Make sure microphone permissions are granted
- Check that your access key is valid
- Ensure audio device is working properly