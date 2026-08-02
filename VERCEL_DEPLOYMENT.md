# Vercel Deployment Guide

This project is configured to deploy as two separate Vercel projects:
1. **Backend (Server)** - Express API running as serverless functions
2. **Frontend (Client)** - Vite React app served as static site

## Backend Deployment (Server)

### 1. Deploy Server to Vercel

```bash
cd server
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Scope: Select your account
- Link to existing project: No
- Project name: digital-loan-approval-api (or your choice)
- Directory: `./` (current directory)
- Override settings: No

### 2. Configure Server Environment Variables

Add these in Vercel Dashboard → Your Server Project → Settings → Environment Variables:

**Required for all environments (Production, Preview, Development):**

```
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loanapproval?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_very_long_secure_random_string_min_32_characters
JWT_EXPIRE=7d

# Admin Seed (optional if not running seed)
ADMIN_EMAIL=dhassgkd@gmail.com
ADMIN_PASSWORD=dhassgkd

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@loanapproval.com

# Frontend URL (IMPORTANT - set after deploying frontend)
CLIENT_URL=https://your-frontend-app.vercel.app

# OpenAI (for AI assessment feature)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=30000
```

### 3. Note Your Server URL

After deployment, Vercel will give you a URL like:
```
https://digital-loan-approval-api.vercel.app
```

**Save this URL** - you'll need it for the frontend configuration.

---

## Frontend Deployment (Client)

### 1. Deploy Client to Vercel

```bash
cd client
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Scope: Select your account
- Link to existing project: No
- Project name: digital-loan-approval (or your choice)
- Directory: `./` (current directory)
- Override settings: No
- Build command: `npm run build`
- Output directory: `dist`

### 2. Configure Client Environment Variables

Add these in Vercel Dashboard → Your Client Project → Settings → Environment Variables:

**Required for all environments (Production, Preview, Development):**

```
# Backend API URL (use the URL from your server deployment)
VITE_API_URL=https://digital-loan-approval-api.vercel.app/api

# EmailJS Configuration (from your EmailJS dashboard)
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_SUBMISSION=template_1grm5uf
VITE_EMAILJS_TEMPLATE_DECISION=template_jqn7gcp
```

### 3. Update Server CLIENT_URL

**IMPORTANT:** After frontend deployment, go back to your **server** project in Vercel:

1. Go to Settings → Environment Variables
2. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://your-frontend-app.vercel.app
   ```
3. Redeploy the server for CORS to work

---

## Post-Deployment Checklist

### Server
- ✅ All environment variables configured
- ✅ MongoDB connection working (check logs)
- ✅ Cloudinary credentials valid
- ✅ OpenAI API key valid (if using AI feature)
- ✅ CLIENT_URL points to deployed frontend
- ✅ Test health endpoint: `https://your-api.vercel.app/api/health`

### Client
- ✅ VITE_API_URL points to deployed backend
- ✅ EmailJS credentials configured
- ✅ Test login/register flow
- ✅ Test file upload (should go to Cloudinary)
- ✅ Test dark/light theme toggle

### Cross-Origin Testing
- ✅ Login from frontend works
- ✅ API calls succeed (no CORS errors)
- ✅ File uploads work
- ✅ Notifications work

---

## Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` in server environment variables matches your frontend URL exactly
- Redeploy server after changing CLIENT_URL

### 500 Server Errors
- Check Vercel server logs: Dashboard → Your Server Project → Deployments → View Function Logs
- Common issues:
  - Missing environment variables
  - Invalid MongoDB connection string
  - Invalid Cloudinary/OpenAI credentials

### File Upload Failures
- Verify Cloudinary credentials are correct
- Check file size is under 5MB
- Ensure file type is allowed (JPEG, PNG, PDF)

### AI Assessment Not Working
- Verify OPENAI_API_KEY is valid
- Check you have credits in your OpenAI account
- OCR processing is CPU-intensive and may timeout on Vercel free tier

### Build Failures (Client)
- Verify all VITE_* environment variables are set
- Check for TypeScript/ESLint errors in code
- Ensure `npm install` succeeds locally

---

## Local Testing with Production URLs

To test locally with production backend:

```bash
# In client directory
echo "VITE_API_URL=https://your-api.vercel.app/api" > .env.local
npm run dev
```

---

## Useful Commands

### Redeploy
```bash
# From respective directory
vercel --prod
```

### View Logs
```bash
vercel logs [deployment-url]
```

### List Projects
```bash
vercel ls
```

### Remove Deployment
```bash
vercel remove [project-name]
```
