# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### 1. Prepare Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables:
   - Copy from `.env.production`
   - Update URLs with your Render service URLs
4. Deploy

### 3. Environment Variables for Vercel
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret
MONGODB_URI=your-mongodb-uri
GEMINI_API_KEY=your-gemini-key
PYTHON_BACKEND_URL=https://your-python-backend.onrender.com
RISK_ANALYZER_URL=https://your-risk-analyzer.onrender.com
PRESCRIPTION_READER_URL=https://your-prescription-reader.onrender.com
```

## Backend Deployment (Render)

### 1. Python Backend Service
1. Create new Web Service on Render
2. Connect your repository
3. Set root directory: `python-backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `streamlit run app.py --server.port=$PORT --server.address=0.0.0.0`

### 2. Risk Analyzer Service
1. Create new Web Service on Render
2. Set root directory: `risk-analyzer`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python app.py`

### 3. Prescription Reader Service
1. Create new Web Service on Render
2. Set root directory: `prescription-reader`
3. Build command: 
   ```
   apt-get update && apt-get install -y tesseract-ocr libgl1-mesa-glx
   pip install -r requirements.txt
   ```
4. Start command: `python app.py`

## Post-Deployment

### 1. Update Frontend URLs
After backend services are deployed, update these in Vercel:
- `PYTHON_BACKEND_URL`
- `RISK_ANALYZER_URL` 
- `PRESCRIPTION_READER_URL`

### 2. Test Services
- Frontend: `https://your-app.vercel.app`
- Python Backend: `https://your-python-backend.onrender.com`
- Risk Analyzer: `https://your-risk-analyzer.onrender.com/health`
- Prescription Reader: `https://your-prescription-reader.onrender.com/health`

### 3. Database Setup
Ensure MongoDB Atlas is configured with proper network access for both Vercel and Render IPs.

## Architecture
```
Frontend (Vercel) → API Routes → Backend Services (Render)
                 ↓
              MongoDB Atlas
```

## Services Overview
- **Frontend**: Next.js app with Genie AI, chat, video calls
- **Python Backend**: Report analysis with Streamlit
- **Risk Analyzer**: Mental health analysis with BioClinicalBERT
- **Prescription Reader**: OCR prescription processing