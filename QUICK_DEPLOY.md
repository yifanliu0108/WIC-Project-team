# Quick Deployment Guide

## Fastest Way: Railway (Backend) + Vercel (Frontend)

### Step 1: Deploy Backend to Railway (5 minutes)

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Python project
5. Add PostgreSQL:
   - Click "New" → "Database" → "Add PostgreSQL"
6. Set environment variables (in your service settings):
   ```
   SECRET_KEY=<generate using: python -c "import secrets; print(secrets.token_urlsafe(32))">
   CORS_ORIGINS=https://your-app.vercel.app
   ```
   (DATABASE_URL is automatically set by Railway)
7. Railway will deploy automatically
8. Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
   (Use the URL from Step 1)
6. Click "Deploy"
7. Copy your frontend URL (e.g., `https://your-app.vercel.app`)

### Step 3: Update Backend CORS (1 minute)

1. Go back to Railway dashboard
2. Update environment variable:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
   (Use the URL from Step 2)
3. Railway will automatically redeploy

### Step 4: Initialize Database (2 minutes)

1. In Railway, click on your backend service
2. Go to "Settings" → "Generate Domain" (if not already done)
3. Open the shell/console in Railway
4. Run:
   ```bash
   cd backend
   python init_db.py
   python scripts/create_test_users.py
   ```

### Step 5: Test (1 minute)

1. Visit your frontend URL
2. Try logging in with test user: `alex_pop` / `test123`
3. Everything should work! 🎉

## Total Time: ~12 minutes

## Alternative: Render (Both on one platform)

### Deploy to Render

1. Go to [render.com](https://render.com)
2. Create PostgreSQL database first
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Set environment variables as shown in DEPLOYMENT.md

## Troubleshooting

**Backend not starting?**
- Check Railway/Render logs
- Verify `Procfile` exists in `backend/` directory
- Ensure `requirements.txt` has all dependencies

**Frontend can't connect to backend?**
- Check `VITE_API_URL` is set correctly
- Verify backend CORS includes frontend URL
- Check backend is running (visit backend URL in browser)

**Database errors?**
- Ensure database is initialized (`python init_db.py`)
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running

## Need Help?

Check the full `DEPLOYMENT.md` guide for detailed instructions and troubleshooting.
