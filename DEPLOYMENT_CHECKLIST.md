# Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment

### Backend
- [ ] All dependencies are in `requirements.txt`
- [ ] `Procfile` exists in `backend/` directory
- [ ] `runtime.txt` specifies Python version
- [ ] `SECRET_KEY` is generated (use: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] Database migration strategy is planned
- [ ] CORS origins are identified

### Frontend
- [ ] `package.json` has all dependencies
- [ ] `vite.config.js` is configured correctly
- [ ] Build command works locally: `npm run build`
- [ ] Environment variable `VITE_API_URL` is ready

### Code
- [ ] All changes are committed to git
- [ ] Repository is pushed to GitHub
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] `.env` files are in `.gitignore`

## Deployment Steps

### 1. Deploy Backend
- [ ] Create account on Railway/Render
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL database
- [ ] Set environment variables:
  - [ ] `DATABASE_URL` (auto-set by platform)
  - [ ] `SECRET_KEY` (generated strong key)
  - [ ] `CORS_ORIGINS` (will update after frontend deploy)
- [ ] Deploy and verify backend is running
- [ ] Test backend health endpoint: `https://your-backend-url/health`
- [ ] Copy backend URL

### 2. Deploy Frontend
- [ ] Create account on Vercel/Netlify
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Set environment variable:
  - [ ] `VITE_API_URL` (backend URL from step 1)
- [ ] Deploy and verify frontend is accessible
- [ ] Copy frontend URL

### 3. Update Backend CORS
- [ ] Go back to backend deployment settings
- [ ] Update `CORS_ORIGINS` with frontend URL
- [ ] Redeploy backend (if needed)

### 4. Initialize Database
- [ ] Open backend shell/console
- [ ] Run: `python init_production_db.py` or `python init_db.py`
- [ ] Verify tables are created
- [ ] (Optional) Run: `python scripts/create_test_users.py`

### 5. Test Deployment
- [ ] Visit frontend URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API endpoints
- [ ] Test profile viewing
- [ ] Test recommendations
- [ ] Test network visualization
- [ ] Test artwork loading

## Post-Deployment

### Security
- [ ] `SECRET_KEY` is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is restricted to your domains
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] No sensitive data exposed in logs

### Monitoring
- [ ] Backend logs are accessible
- [ ] Frontend deployment logs are accessible
- [ ] Error tracking is set up (optional)
- [ ] Database connection is stable

### Documentation
- [ ] Deployment URLs are documented
- [ ] Environment variables are documented
- [ ] Team members have access (if applicable)

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Backend won't start | Check logs, verify Procfile, check Python version |
| Database connection error | Verify DATABASE_URL, check database is running |
| CORS errors | Add frontend URL to CORS_ORIGINS, restart backend |
| Frontend can't connect | Check VITE_API_URL, verify backend is running |
| Build fails | Check Node version, verify all dependencies |
| 404 on routes | Check rewrite rules in vercel.json/netlify.toml |

## Environment Variables Reference

### Backend
```bash
DATABASE_URL=postgresql://...  # Auto-set by platform
SECRET_KEY=your-generated-key  # Generate with Python
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend
```bash
VITE_API_URL=https://your-backend.up.railway.app
```

## URLs to Save

- Backend URL: `___________________________`
- Frontend URL: `___________________________`
- Database URL: `___________________________` (if external)

## Notes

_Add any deployment-specific notes here_
