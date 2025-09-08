# Minds - Mental Health Platform Deployment Guide

## 🌐 Website Analysis

### Core Features
- **Authentication**: NextAuth with Google OAuth + Email/Password
- **User Types**: Patients, Doctors, Pharmacists
- **Real-time Chat**: Doctor-Patient consultations
- **AI Assistant**: Gemini-powered health advisor
- **Voice Assistant**: VAPI integration for voice interactions
- **Medicine Management**: Pharmacy inventory system
- **Document Management**: Medical reports and prescriptions
- **Emergency Services**: SOS and escalation system
- **Period Tracker**: Women's health monitoring
- **Multi-language Support**: English, Hindi, Marathi

### Database Models
- Users, Doctors, Pharmacists
- Medicines, ChatHistory, Documents
- EscalationRequests, Feedback, Sessions
- PeriodTracker, MedicalReports

## 🚀 Deployment Setup

### 1. MongoDB Atlas Configuration

Replace the placeholder in `.env.local`:
```env
MONGODB_ATLAS_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/minds?retryWrites=true&w=majority
```

### 2. Environment Variables for Production

Set these in your deployment platform:

```env
# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Database
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/minds?retryWrites=true&w=majority

# AI Services
GEMINI_API_KEY=your_gemini_api_key
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Communication
TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Excluded Python Services

These services are NOT deployed (as requested):
- `/python-backend/` - Report analyzer backend
- `/risk-analyzer/` - Risk analysis service
- `/scans-analyzer/` - Medical scan analyzer
- `/prescription-reader/` - OCR prescription reader

### 4. Build Configuration

The website will automatically:
- Use MongoDB Atlas in production
- Use local MongoDB in development
- Connect to the same database from both environments

### 5. Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

#### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables

#### Railway/Render
1. Connect repository
2. Set environment variables
3. Deploy with auto-scaling

### 6. Post-Deployment Checklist

- [ ] Test user registration/login
- [ ] Verify Google OAuth works
- [ ] Test doctor-patient chat
- [ ] Check pharmacy features
- [ ] Verify AI assistant responses
- [ ] Test voice assistant (VAPI)
- [ ] Check mobile responsiveness
- [ ] Test emergency SOS features

### 7. Database Migration

Data will automatically sync between:
- **Development**: Local MongoDB
- **Production**: MongoDB Atlas

Both environments use the same database structure and models.

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Local + Atlas)
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
- **Voice**: VAPI
- **Communication**: Twilio
- **Maps**: Google Maps API
- **Deployment**: Vercel/Netlify ready

## 📱 Features Ready for Production

✅ **Core Platform**
- User authentication and profiles
- Doctor-patient consultations
- Pharmacy management system
- AI health advisor
- Emergency services

✅ **Advanced Features**
- Voice assistant integration
- Multi-language support
- Real-time chat system
- Document management
- Period tracking
- Mobile responsive design

❌ **Excluded Services**
- Python-based report analysis
- Medical scan analysis
- OCR prescription reading

The platform is production-ready with all essential features for a comprehensive mental health and medical consultation system.