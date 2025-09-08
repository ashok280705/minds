# Complete Deployment Guide - Frontend + Python Backends

## 🎯 Deployment Architecture
- **Frontend**: Vercel (Next.js)
- **Python Backends**: Render (4 separate services)
- **Database**: MongoDB Atlas

## 📋 Services Overview
1. **Frontend** (Vercel) - Main Next.js application
2. **prescription-reader** (Render) - OCR prescription reading
3. **risk-analyzer** (Render) - Health report analysis
4. **scans-analyzer** (Render) - Medical scan analysis
5. **python-backend** (Render) - Main backend service

---

## 🚀 Step 1: Deploy Frontend on Vercel

### 1.1 Push to GitHub
```bash
cd "/Users/darshanpatil/Documents/temp/Pccoe Hackathon/minds"
git add .
git commit -m "Complete deployment setup"
git push origin main
```

### 1.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your `minds` repository
5. Click **"Deploy"**

### 1.3 Add Environment Variables in Vercel
Project Settings → Environment Variables:

```
GOOGLE_CLIENT_ID=1013365918137-1fdfbk0rc288qn0ioq75ffbl1inlhqva.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
MONGODB_ATLAS_URI=mongodb+srv://progamerz9764:refinify1432@refinify.jovjgcc.mongodb.net/minds?retryWrites=true&w=majority
NEXTAUTH_SECRET=piaPfUg5y+NP+5wf+O+IwI3hwJQN20X8/sttLvCblGg=
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=AIzaSyCUD3MXSMK6Z9Klkt-D1volQBh6MLhzEEM
TWILIO_SID=AC8f131f83252238a3e144e34e99c741c4
TWILIO_AUTH=9dfd48233734ff5a3d8c5f977f4ffb58
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VAPI_PRIVATE_KEY=5e5a3fb5-0b7d-41b0-81ef-d3dfddbed249
VAPI_PUBLIC_KEY=a4e52b1b-a945-4d62-92ba-69a11ee1e534
NEXT_PUBLIC_VAPI_PUBLIC_KEY=a4e52b1b-a945-4d62-92ba-69a11ee1e534
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ
NODE_ENV=production

# Backend URLs (add after deploying backends)
PRESCRIPTION_READER_URL=https://prescription-reader-xxx.onrender.com
RISK_ANALYZER_URL=https://risk-analyzer-xxx.onrender.com
SCANS_ANALYZER_URL=https://scans-analyzer-xxx.onrender.com
PYTHON_BACKEND_URL=https://python-backend-xxx.onrender.com
```

---

## 🐍 Step 2: Deploy Python Backends on Render

### 2.1 Deploy prescription-reader
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. **Root Directory**: `prescription-reader`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `python app.py`
8. **Plan**: Free
9. Click **"Create Web Service"**

### 2.2 Deploy risk-analyzer
1. Click **"New"** → **"Web Service"**
2. Connect same repository
3. **Root Directory**: `risk-analyzer`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `python app.py`
6. **Plan**: Free
7. Click **"Create Web Service"**

### 2.3 Deploy scans-analyzer
1. Click **"New"** → **"Web Service"**
2. Connect same repository
3. **Root Directory**: `scans-analyzer`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `python app.py`
6. **Plan**: Free
7. Click **"Create Web Service"**

### 2.4 Deploy python-backend
1. Click **"New"** → **"Web Service"**
2. Connect same repository
3. **Root Directory**: `python-backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `python app.py`
6. **Plan**: Free
7. Click **"Create Web Service"**

---

## 🔗 Step 3: Connect Frontend to Backends

### 3.1 Get Backend URLs
After each Render deployment, you'll get URLs like:
- `https://prescription-reader-xxx.onrender.com`
- `https://risk-analyzer-xxx.onrender.com`
- `https://scans-analyzer-xxx.onrender.com`
- `https://python-backend-xxx.onrender.com`

### 3.2 Update Vercel Environment Variables
Add the backend URLs to your Vercel environment variables:

```
PRESCRIPTION_READER_URL=https://prescription-reader-xxx.onrender.com
RISK_ANALYZER_URL=https://risk-analyzer-xxx.onrender.com
SCANS_ANALYZER_URL=https://scans-analyzer-xxx.onrender.com
PYTHON_BACKEND_URL=https://python-backend-xxx.onrender.com
```

### 3.3 Update NEXTAUTH_URL
Replace with your actual Vercel domain:
```
NEXTAUTH_URL=https://your-actual-vercel-domain.vercel.app
```

### 3.4 Redeploy Frontend
Click **"Redeploy"** in Vercel to apply the new environment variables.

---

## ✅ Step 4: Verification

### 4.1 Test Frontend
- Visit your Vercel URL
- Test authentication
- Check all features work

### 4.2 Test Backend Services
- Visit each Render URL
- Should show service status
- Test API endpoints

### 4.3 Test Integration
- Upload prescription → prescription-reader
- Upload health report → risk-analyzer
- Upload medical scan → scans-analyzer

---

## 🔧 Troubleshooting

### Frontend Issues:
- Check Vercel function logs
- Verify environment variables
- Check MongoDB Atlas connection

### Backend Issues:
- Check Render service logs
- Verify Python dependencies
- Check service startup

### Integration Issues:
- Verify backend URLs in Vercel
- Check CORS settings
- Test API endpoints directly

---

## 📊 Final Architecture

```
Frontend (Vercel)
├── Next.js App
├── API Routes
└── MongoDB Atlas

Python Backends (Render)
├── prescription-reader
├── risk-analyzer
├── scans-analyzer
└── python-backend
```

## 🎉 Success!

Your complete healthcare platform is now deployed:
- **Frontend**: `https://your-project.vercel.app`
- **Prescription Reader**: `https://prescription-reader-xxx.onrender.com`
- **Risk Analyzer**: `https://risk-analyzer-xxx.onrender.com`
- **Scans Analyzer**: `https://scans-analyzer-xxx.onrender.com`
- **Python Backend**: `https://python-backend-xxx.onrender.com`

All services are connected and ready for production use!