# Quick Start

## Prerequisites
- Python 3.9+, Node.js 16+ (SQLite included with Python)
- Optional for production-style setup: PostgreSQL

## Setup

**Automated:**
```bash
./setup.sh
```

**Manual:**

Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_db.py  # Uses DATABASE_URL (defaults to SQLite)
python run.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Start both servers (backend on :8000, frontend on :3000)
2. Open `http://localhost:3000`
3. Register/Login, then navigate with sidebar

## Troubleshooting

- **Database error**:
  - SQLite (default): check `backend/intune.db` path is writable and not locked
  - PostgreSQL: ensure server is running and `DATABASE_URL` points to an existing database
- **Port in use**: Backend: change in `run.py`, Frontend: Vite auto-finds port
- **CORS error**: Ensure `CORS_ORIGINS` in `.env` includes frontend URL

API docs: `http://localhost:8000/docs`
