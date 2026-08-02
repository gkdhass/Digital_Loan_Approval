# Vercel Production Setup & CORS Configuration

## Critical Backend Environment Variables

Set these in **Vercel Dashboard → Backend Project → Settings → Environment Variables**:

### Production URLs (Recommended)
```bash
CLIENT_URL=https://gkdhassbank.vercel.app,http://localhost:5173
ALLOW_VERCEL_PREVIEWS=false
```

### Development/Testing (Allow All Preview URLs)
```bash
CLIENT_URL=https://gkdhassbank.vercel.app,http://localhost:5173
ALLOW_VERCEL_PREVIEWS=true
```

**Note:** Setting `ALLOW_VERCEL_PREVIEWS=true` allows ALL `*.vercel.app` URLs (including previews). Use only for development/testing. Set to `false` in production for security.

---

## Frontend URLs - Use These for Testing

### ✅ Production URL (Stable - Use This)
```
https://gkdhassbank.vercel.app
```

### ✅ Localhost (Development)
```
http://localhost:5173
```

### ❌ DO NOT Use Preview URLs for Testing
```
https://digital-loan-approval-z442.vercel.app  ❌ (changes every deployment)
https://digital-loan-approval-abc123.vercel.app ❌ (changes every deployment)
```

**Preview URLs change on every push** and will break CORS unless `ALLOW_VERCEL_PREVIEWS=true` is set.

---

## Crash Prevention Fixes Applied

### Issue: `process.exit(1)` in Database Connection
**Problem:** Server crashes with exit status 1 when MongoDB connection fails
**Fixed:** 
- Removed `process.exit(1)` from `config/db.js`
- Added connection reuse for serverless cold starts
- Database errors now throw instead of crashing the entire function

### Issue: Unhandled Promise Rejections
**Fixed:** Added global error handlers in `server.js`:
```javascript
process.on('uncaughtException', ...)
process.on('unhandledRejection', ...)
```

### Issue: Health Check Route Crashing
**Fixed:** Wrapped health check in try-catch and added database status reporting

---

## CORS Debugging

The server now logs every CORS decision:

### Logs to Watch For:
```
✅ CORS allowed (explicit): https://gkdhassbank.vercel.app
✅ CORS allowed (Vercel preview): https://preview-abc123.vercel.app
❌ CORS blocked: https://unauthorized-site.com
```

### Check Vercel Function Logs:
1. Go to Vercel Dashboard → Backend Project → Deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Click on any function execution
5. Look for CORS logs

---

## Testing Checklist

### Before Testing:
1. ✅ Backend deployed with CLIENT_URL set
2. ✅ Frontend deployed to production URL
3. ✅ Frontend environment variable `VITE_API_URL` set to: `https://digital-loan-approval.vercel.app/api`

### Test Registration:
1. Go to: `https://gkdhassbank.vercel.app`
2. Open browser DevTools → Network tab
3. Try to register
4. Check request URL: Should be `https://digital-loan-approval.vercel.app/api/auth/register`
5. Check CORS headers in response

### If CORS Fails:
1. Check Vercel backend logs for: `❌ CORS blocked: [your-origin]`
2. Verify CLIENT_URL includes the origin being blocked
3. Or set `ALLOW_VERCEL_PREVIEWS=true` temporarily for testing

---

## Production vs Development

### Production Setup (Secure)
```bash
# Backend Vercel Env Vars
CLIENT_URL=https://gkdhassbank.vercel.app
ALLOW_VERCEL_PREVIEWS=false
NODE_ENV=production
```

```bash
# Frontend Vercel Env Vars
VITE_API_URL=https://digital-loan-approval.vercel.app/api
```

### Development Setup (Flexible)
```bash
# Backend Vercel Env Vars
CLIENT_URL=https://gkdhassbank.vercel.app,http://localhost:5173
ALLOW_VERCEL_PREVIEWS=true
NODE_ENV=production
```

```bash
# Local client/.env.local
VITE_API_URL=https://digital-loan-approval.vercel.app/api
```

---

## Common Errors & Solutions

### Error: "CORS blocked"
**Solution:** Add frontend URL to CLIENT_URL or enable ALLOW_VERCEL_PREVIEWS

### Error: "404 Not Found on /auth/register"
**Solution:** Verify VITE_API_URL includes `/api` suffix

### Error: "500 Exit Status 1"
**Solution:** Check MongoDB connection string, ensure MONGODB_URI is set in Vercel

### Error: "MongoDB Connection Failed"
**Solution:** 
- Check MONGODB_URI format
- Whitelist Vercel IPs in MongoDB Atlas (or allow all: 0.0.0.0/0)
- Ensure MongoDB Atlas cluster is not paused

---

## Quick Links

- Production Frontend: https://gkdhassbank.vercel.app
- Production Backend: https://digital-loan-approval.vercel.app
- Backend Health: https://digital-loan-approval.vercel.app/
- Vercel Dashboard: https://vercel.com/dashboard
