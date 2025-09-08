# Environment Variables Setup

## 🔧 For Vercel Deployment

Copy these exact values to Vercel Environment Variables:

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
```

## ⚠️ Important: Update After Deployment

After Vercel gives you a domain, update:
```
NEXTAUTH_URL=https://your-actual-vercel-domain.vercel.app
```

## 🗄️ Database Configuration

- **Local**: Uses `mongodb://127.0.0.1:27017/minds`
- **Production**: Uses your Atlas URI automatically
- **No code changes needed** - environment-based switching

## 🔐 Google OAuth Setup

Add these redirect URLs in Google Console:
- `http://localhost:3000/api/auth/callback/google` (local)
- `https://your-vercel-domain.vercel.app/api/auth/callback/google` (production)

## ✅ Ready to Deploy!

All configuration files created:
- `vercel.json` - Vercel deployment config
- `render.yaml` - Render deployment config (if needed)
- `.vercelignore` - Excludes Python backends
- Environment variables ready to copy-paste