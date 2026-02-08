# Quick Start

## Prerequisites
- Python 3.9+, Node.js 16+, PostgreSQL

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
# Update .env with DATABASE_URL
createdb intune_db
python init_db.py
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

- **Database error**: Check PostgreSQL is running, verify DATABASE_URL in `.env`
- **Port in use**: Backend: change in `run.py`, Frontend: Vite auto-finds port
- **CORS error**: Ensure `CORS_ORIGINS` in `.env` includes frontend URL

API docs: `http://localhost:8000/docs`
