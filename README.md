# In Tune - Music-Based Friend Making Platform

A dating/friend-making website based on music taste compatibility.

## Tech Stack

- **Backend**: Python + FastAPI, SQLite (dev) / PostgreSQL (prod), SQLAlchemy, JWT
- **Frontend**: React 18, Vite, React Router

## Quick Setup

```bash
./setup.sh
```

Then:
1. Initialize database: `cd backend && python init_db.py`
2. Start backend: `cd backend && python run.py`
3. Start frontend: `cd frontend && npm run dev`

Database behavior:
- Default local setup uses SQLite (`sqlite:///./intune.db`)
- PostgreSQL is supported by setting `DATABASE_URL` in `backend/.env` before running `python init_db.py`

## Features

- User authentication & profiles
- Song management & favorites
- Connection system with similarity scores
- Activity feed & search
- Dashboard with network graph, profile cards, top songs

## Project Structure

```
backend/     # FastAPI API
frontend/    # React app
```

## Git Commands

**First time setup:**
```bash
git clone https://github.com/yifanliu0108/WIC-Project-team.git
cd WIC-Project-team
./setup.sh
```

**Daily workflow:**
```bash
git pull origin main          # Get latest changes
git checkout -b feature/name  # Create branch for your work
# ... make changes ...
git add .
git commit -m "Describe what changes you made"
git push origin feature/name  # Push your branch
# Then create Pull Request on GitHub
```

**Basic commands:**
- `git status` - See what changed
- `git add .` - Stage all changes
- `git commit -m "message"` - Save changes
- `git push origin main` - Upload to GitHub
- `git pull origin main` - Download from GitHub

See [QUICKSTART.md](QUICKSTART.md) for detailed setup.
