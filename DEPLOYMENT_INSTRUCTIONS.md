# Minds Platform - Deployment Instructions

## 🚀 Frontend Deployment (Vercel)

### Step 1: Prepare Vercel Deployment
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and import your GitHub repository
3. Vercel will auto-detect Next.js configuration

### Step 2: Set Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```env
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
```

### Step 3: Deploy
- Click "Deploy" - Vercel will automatically build and deploy
- Your frontend will be live at `https://your-project-name.vercel.app`

## 🖥️ Backend Deployment (Render) - Optional

### If you want to deploy Python services separately:

### Step 1: Prepare Render Deployment
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Render Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node
- **Plan**: Free

### Step 3: Set Environment Variables in Render
Add the same environment variables as Vercel

## 📋 Important Notes

### ✅ What's Included in Deployment:
- Complete Next.js frontend with all features
- All API routes (built into Next.js)
- MongoDB Atlas database connection
- Authentication system
- AI chat features
- Pharmacy management
- Doctor-patient consultations
- Emergency services

### ❌ What's NOT Deployed (as requested):
- Python backend services
- Report analyzer
- Scan analyzer
- OCR prescription reader

### 🔄 Database Configuration:
- **Local Development**: Uses local MongoDB
- **Production (Vercel)**: Uses MongoDB Atlas automatically
- No code changes needed - environment-based switching

### 🌐 Post-Deployment:
1. Update `NEXTAUTH_URL` with your actual Vercel domain
2. Test all features on the live site
3. Verify MongoDB Atlas connection
4. Check Google OAuth redirect URLs

## 🔧 Troubleshooting

### If deployment fails:
1. Check environment variables are set correctly
2. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Verify Google OAuth redirect URLs include your Vercel domain
4. Check Vercel function logs for errors

### Database Issues:
- MongoDB Atlas should auto-connect in production
- Local development continues to use local MongoDB
- No manual switching required

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] All environment variables set in Vercel
- [ ] `NEXTAUTH_URL` updated with Vercel domain
- [ ] Google OAuth redirect URLs updated
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Test deployment successful
- [ ] All features working on live site

Your Minds platform will be fully functional on Vercel with MongoDB Atlas backend!