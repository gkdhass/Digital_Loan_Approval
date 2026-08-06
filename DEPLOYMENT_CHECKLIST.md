# 🚀 Deployment Checklist - gkbank.vercel.app

## ✅ Issues Fixed in Code

### Issue 1: MongoDB Connection Timeout
- **File:** `server/config/db.js` (Line 14)
- **Fixed:** Increased `serverSelectionTimeoutMS` from 5000ms to 30000ms
- **Added:** `family: 4` to force IPv4 (Vercel IPv6 issues)
- **Fixed:** MongoDB URI now includes database name: `/loanapproval`

### Issue 2: Frontend API Path Missing `/api`
- **File:** `client/.env` (Line 2)
- **Changed:** `https://digital-loan-approval.vercel.app/` → `https://digital-loan-approval.vercel.app/api`
- **Result:** Requests now go to `/api/auth/register` instead of `/auth/register`

---

## 🔧 Required Vercel Configuration

### Backend Project: `digital-loan-approval`

Go to: https://vercel.com/dashboard → digital-loan-approval → Settings → Environment Variables

**Set These Exactly:**

```bash
# MongoDB Connection (CRITICAL - Must include database name)
MONGODB_URI=mongodb+srv://mohandhass:mohandhass@afformed.r8qyzze.mongodb.net/loanapproval?retryWrites=true&w=majority&appName=afformed

# CORS - Frontend URL (NO TRAILING SLASH)
CLIENT_URL=https://gkbank.vercel.app,http://localhost:5173

# Node Environment
NODE_ENV=production

# JWT
JWT_SECRET=434b359c2981eec153f00df49a27834286bf13d6796a6bfda9aee7882585a376
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=fq0h3efj
CLOUDINARY_API_KEY=586634626644774
CLOUDINARY_API_SECRET=BWRibBWmy1tl1aLWslsgU8IiL4w

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=dhassgkd@gmail.com
EMAIL_PASSWORD=nalgyhyeumqvtcrd
EMAIL_FROM=dhassgkd@gmail.com
```

**After setting, click "Redeploy" for changes to take effect.**

---

### Frontend Project: `gkbank`

Go to: https://vercel.com/dashboard → gkbank → Settings → Environment Variables

**Set These Exactly:**

```bash
# Backend API URL (MUST END WITH /api)
VITE_API_URL=https://digital-loan-approval.vercel.app/api

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_a96uhbw
VITE_EMAILJS_PUBLIC_KEY=Z525UGGzFMZ3lyG4M
VITE_EMAILJS_TEMPLATE_SUBMITTED=template_1grm5uf
VITE_EMAILJS_TEMPLATE_APPROVED=template_jqn7gcp
```

**After setting, click "Redeploy" for changes to take effect.**

---

## 🗄️ MongoDB Atlas Configuration

### Network Access (CRITICAL)

1. Go to: https://cloud.mongodb.com/
2. Select your project: `afformed`
3. Go to: **Network Access** (left sidebar)
4. Click: **Add IP Address**
5. Select: **Allow Access from Anywhere**
6. IP Address: `0.0.0.0/0`
7. Click: **Confirm**

**Why:** Vercel serverless functions use dynamic IPs, so you must allow all IPs.

### Database User (Verify)

1. Go to: **Database Access** (left sidebar)
2. Verify user exists: `mohandhass`
3. Password: `mohandhass`
4. Privileges: **Read and write to any database** or **Atlas admin**

---

## 🧪 Testing After Deployment

### Step 1: Check Backend Health

```bash
curl https://digital-loan-approval.vercel.app/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Digital Loan Approval API is running",
  "database": "connected"
}
```

**If `database: "disconnected"`:**
- MongoDB URI is wrong or database name missing
- Network Access not set to 0.0.0.0/0
- Username/password incorrect

---

### Step 2: Check Backend Logs

Go to: Vercel Dashboard → digital-loan-approval → Deployments → Latest → View Function Logs

**Look for:**
```
✅ MongoDB Connected: afformed.r8qyzze.mongodb.net
🔒 CORS Allowed Origins: ['http://localhost:5173', (...), 'https://gkbank.vercel.app']
```

**If you see:**
```
❌ MongoDB Connection Error: Server selection timed out after 30000ms
```
- Check Network Access in MongoDB Atlas
- Verify MONGODB_URI includes `/loanapproval` database name

---

### Step 3: Test Frontend Registration

1. Go to: https://gkbank.vercel.app
2. Open DevTools: F12 → Network tab → Clear
3. Try to register a new account
4. Check the request in Network tab

**Expected Request URL:**
```
✅ POST https://digital-loan-approval.vercel.app/api/auth/register
```

**NOT:**
```
❌ POST https://digital-loan-approval.vercel.app/auth/register
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://gkbank.vercel.app
Access-Control-Allow-Credentials: true
```

**Expected Status:**
```
201 Created (success)
or
400 Bad Request (validation error, but backend is working)
```

---

### Step 4: Check for CORS Errors

In Browser Console (F12 → Console), should see NO errors like:
```
❌ Access to XMLHttpRequest at '...' has been blocked by CORS policy
```

If you see CORS error:
1. Verify `CLIENT_URL` in backend includes `https://gkbank.vercel.app`
2. Check backend logs for: `❌ CORS blocked: https://gkbank.vercel.app`
3. Redeploy backend after changing CLIENT_URL

---

## 📊 Success Criteria

- [ ] Backend health endpoint returns `"database": "connected"`
- [ ] Backend logs show `✅ MongoDB Connected`
- [ ] Frontend requests go to `/api/auth/register` (not `/auth/register`)
- [ ] No CORS errors in browser console
- [ ] Registration completes successfully (201 or 400, not 404)
- [ ] Backend logs show `✅ CORS allowed: https://gkbank.vercel.app`

---

## 🐛 Common Issues & Solutions

### "Server selection timed out"
- **Cause:** MongoDB Network Access doesn't allow Vercel IPs
- **Fix:** Add `0.0.0.0/0` in MongoDB Atlas → Network Access

### "404 Not Found" on `/auth/register`
- **Cause:** Frontend VITE_API_URL missing `/api` suffix
- **Fix:** Update to `https://digital-loan-approval.vercel.app/api`

### "CORS policy blocked"
- **Cause:** CLIENT_URL doesn't include frontend URL
- **Fix:** Set `CLIENT_URL=https://gkbank.vercel.app,http://localhost:5173`

### "Authentication failed" in MongoDB
- **Cause:** Wrong username/password in MONGODB_URI
- **Fix:** Verify credentials match MongoDB Atlas user

### Database name missing
- **Cause:** MONGODB_URI ends with `/?` instead of `/loanapproval?`
- **Fix:** Add `/loanapproval` before query params

---

## 🔗 Quick Links

- **Frontend:** https://gkbank.vercel.app
- **Backend:** https://digital-loan-approval.vercel.app
- **Backend Health:** https://digital-loan-approval.vercel.app/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
