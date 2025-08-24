# Multi-Agent Mental Health Chatbot

## Architecture

### Agent 1: Chatbot Agent (Gemini API)
- Handles empathetic conversation with users
- Provides mental health support and guidance
- Suggests mood music for emotional support

### Agent 2: Risk Analyzer Agent (BioClinicalBERT)
- Classifies user messages: Normal, Depressed, Suicidal
- Uses Hugging Face BioClinicalBERT model
- Fallback to keyword-based analysis if model unavailable

## Setup Instructions

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Setup Python Risk Analyzer Service
```bash
cd risk-analyzer
chmod +x start.sh
./start.sh
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

### 4. Start Services
```bash
# Terminal 1: Start Risk Analyzer (Python)
cd risk-analyzer && ./start.sh

# Terminal 2: Start Next.js App
npm run dev
```

## API Endpoints

### Chat with Risk Analysis
```
POST /api/gemini-chat
Body: { "messages": [...], "userId": "user_id" }
Response: { 
  "reply": "...", 
  "escalate": boolean,
  "riskAnalysis": {
    "level": "Normal|Depressed|Suicidal",
    "confidence": 0.85,
    "method": "bioclinicalbert|keyword|fallback"
  }
}
```

### Risk Analyzer Health Check
```
GET /api/risk-status
Response: { "status": "healthy|unavailable|error" }
```

## Escalation Flow

1. User sends message
2. Gemini generates empathetic response
3. BioClinicalBERT analyzes risk level
4. If "Suicidal" detected:
   - Create escalation record
   - Notify via Socket.IO
   - [TODO] Send WhatsApp to emergency contact
   - [TODO] Connect available doctor

## Future Integrations

### WhatsApp API Integration
- Add WhatsApp Business API credentials
- Implement emergency contact notification
- Update `escalationService._notifyEmergencyContact()`

### Doctor Connection
- Implement doctor availability system
- Add video call integration
- Update `escalationService._connectDoctor()`

## File Structure
```
├── app/api/gemini-chat/route.js     # Updated with risk analysis
├── lib/riskAnalyzer.js              # Node.js client for Python service
├── lib/escalationService.js         # Handles crisis escalation
├── risk-analyzer/
│   ├── app.py                       # Python Flask service
│   ├── requirements.txt             # Python dependencies
│   └── start.sh                     # Startup script
```