# Deployment Guide for InTune

This guide covers deploying both the backend (FastAPI) and frontend (React/Vite) to production.

## Recommended Deployment Platforms

- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel or Netlify
- **Database**: PostgreSQL (provided by Railway/Render or external like Supabase)

## Option 1: Railway (Backend) + Vercel (Frontend) - Recommended

### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Python
   - Add PostgreSQL database:
     - Click "New" → "Database" → "Add PostgreSQL"
   - Set environment variables:
     ```
     DATABASE_URL=<automatically set by Railway>
     SECRET_KEY=<generate a random secret key>
     CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
     ```
   - Railway will automatically detect and run the app

3. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Note this URL for frontend configuration

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.up.railway.app
     ```
   - Click "Deploy"

3. **Get Frontend URL**
   - Vercel will provide: `https://your-app.vercel.app`
   - Update backend `CORS_ORIGINS` to include this URL

## Option 2: Render (Both Backend & Frontend)

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `intune-backend`
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: `backend`
   - Add PostgreSQL database:
     - Click "New" → "PostgreSQL"
   - Set environment variables:
     ```
     DATABASE_URL=<from PostgreSQL service>
     SECRET_KEY=<generate random key>
     CORS_ORIGINS=https://your-frontend.onrender.com
     ```
   - Click "Create Web Service"

### Frontend Deployment (Render)

1. **Deploy Frontend**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `intune-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend.onrender.com
     ```
   - Click "Create Static Site"

## Environment Variables Setup

### Backend Environment Variables

Create a `.env` file or set in your deployment platform:

```bash
# Database (automatically set by Railway/Render if using their PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Security (IMPORTANT: Generate a strong random key)
SECRET_KEY=your-super-secret-key-change-this-in-production

# CORS - Add your frontend URLs
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app

# Optional: Spotify API (if using)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

**Generate SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

### Frontend Environment Variables

Set in Vercel/Netlify dashboard:

```bash
VITE_API_URL=https://your-backend-url.up.railway.app
```

## Database Setup

### Initialize Database on Production

After deployment, you need to initialize the database schema:

1. **Option A: SSH into your server** (if using VPS)
   ```bash
   python init_db.py
   ```

2. **Option B: Use Railway/Render Shell**
   - Open the shell/console in your deployment platform
   - Run: `python init_db.py`

3. **Option C: Create a migration script**
   - Add a startup script that runs migrations automatically

### Create Test Users

After database is initialized, create test users:

```bash
python scripts/create_test_users.py
```

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is deployed and accessible
- [ ] Database is initialized
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Test user login works
- [ ] API endpoints are accessible
- [ ] Frontend can connect to backend
- [ ] Test users are created (optional)

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Verify database exists

2. **CORS Errors**
   - Add frontend URL to `CORS_ORIGINS`
   - Restart backend after changing CORS settings

3. **Module Not Found**
   - Ensure `requirements.txt` includes all dependencies
   - Check Python version matches `runtime.txt`

### Frontend Issues

1. **API Connection Failed**
   - Verify `VITE_API_URL` is set correctly
   - Check backend is running
   - Ensure CORS is configured

2. **Build Errors**
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`
   - Review build logs for specific errors

## Custom Domain Setup

### Backend (Railway/Render)
- Go to your service settings
- Add custom domain
- Update DNS records as instructed

### Frontend (Vercel/Netlify)
- Go to project settings → Domains
- Add your custom domain
- Update DNS records
- Update `CORS_ORIGINS` in backend to include new domain

## Security Checklist

- [ ] `SECRET_KEY` is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is restricted to your frontend domains
- [ ] HTTPS is enabled (automatic on Vercel/Netlify/Railway)
- [ ] Environment variables are not committed to git
- [ ] `.env` files are in `.gitignore`

## Monitoring

- **Backend**: Check logs in Railway/Render dashboard
- **Frontend**: Check Vercel/Netlify deployment logs
- **Database**: Monitor connection pool and queries
- **Errors**: Set up error tracking (Sentry, etc.)

## Cost Estimates

- **Railway**: Free tier available, ~$5-20/month for production
- **Render**: Free tier available, ~$7-25/month for production
- **Vercel**: Free tier for personal projects
- **Netlify**: Free tier for personal projects
- **PostgreSQL**: Usually included with Railway/Render

## Quick Start Commands

### Local Testing Before Deployment

```bash
# Backend
cd backend
source venv/bin/activate
python run.py

# Frontend (in another terminal)
cd frontend
npm run dev
```

### Production Build Test

```bash
# Frontend
cd frontend
npm run build
npm run preview  # Test production build locally

# Backend
# Test with production-like environment variables
```
