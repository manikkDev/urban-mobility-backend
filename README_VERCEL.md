# Backend Vercel Deployment - IMPORTANT

## Critical Files for Vercel

Your backend now has the correct structure for Vercel serverless deployment:

```
Backend/
├── api/
│   └── index.js          ← Vercel serverless function entry point
├── src/
│   ├── app.js            ← Express app
│   ├── server.js         ← Local development server
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── ...
├── vercel.json           ← Vercel configuration
└── package.json
```

## Deploy Steps

### 1. Push to Git (Recommended)

If using Git deployment:
```bash
git add .
git commit -m "Fix Vercel serverless configuration"
git push
```

Vercel will automatically redeploy.

### 2. Or Redeploy via Vercel Dashboard

1. Go to https://vercel.com
2. Find your backend project
3. Go to Deployments tab
4. Click "Redeploy" on the latest deployment

### 3. Verify Environment Variables

Make sure these are set in Vercel:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://urban-mobility-frontend-9i7r.vercel.app
```

**Important**: No trailing slash on FRONTEND_URL!

## Test After Deployment

Test these URLs (replace with your backend URL):

```bash
# Root endpoint
https://urban-mobility-backend.vercel.app/

# Health check
https://urban-mobility-backend.vercel.app/health

# Get schemes
https://urban-mobility-backend.vercel.app/api/schemes

# Get issues
https://urban-mobility-backend.vercel.app/api/issues
```

All should return JSON responses (not "Cannot GET /api").

## What Changed

- Created `api/index.js` as the Vercel serverless function entry point
- Updated `vercel.json` to point to `api/index.js` instead of `src/server.js`
- Firebase is now initialized in the serverless function handler
- `src/server.js` is only used for local development

## Frontend Environment Variable

Your frontend needs:
```
VITE_API_BASE_URL=https://urban-mobility-backend.vercel.app/api
```

Note the `/api` at the end!
