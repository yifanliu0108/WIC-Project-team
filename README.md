# In Tune - Music-Based Friend Making Platform

A dating/friend-making website based on music taste compatibility.

## Tech Stack

- **Backend**: Python + FastAPI, PostgreSQL, SQLAlchemy, JWT
- **Frontend**: React 18, Vite, React Router

## Quick Setup

```bash
./setup.sh
```

Then:
1. Update `backend/.env` with PostgreSQL credentials
2. Create database: `createdb intune_db`
3. Initialize: `cd backend && python init_db.py`
4. Start backend: `cd backend && python run.py`
5. Start frontend: `cd frontend && npm run dev`

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
