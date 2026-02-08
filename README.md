# In Tune - Music-Based Friend Making Platform

A dating/friend-making website based on music taste compatibility. Built for Women In Computing Project Team, UCSD.

## Project Overview

In Tune connects people based on their music preferences. Users can discover others with similar music tastes, share songs, and build connections through their shared love of music.

## Tech Stack

### Backend
- **Python 3.9+** with **FastAPI** - Modern async web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **JWT** - Authentication
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing

## Features

### MVP Features
- ✅ User authentication (register/login)
- ✅ User profiles with music preferences
- ✅ Song management (add, view, favorite songs)
- ✅ Connection system (send/accept connections)
- ✅ Similarity score calculation
- ✅ Activity feed
- ✅ Search functionality
- ✅ Connection statistics

### Pages
- **Dashboard**: Network graph, search bar, profile cards, similarity scores, top songs
- **Feed**: Activity feed and notification center
- **Profile**: Songs, artists, genres, albums, connection statistics
- **Login**: Registration and authentication

## Getting Started

**🚀 For the fastest setup, see [QUICKSTART.md](QUICKSTART.md)**

### Quick Setup (Recommended)

Run the automated setup script:
```bash
chmod +x setup.sh
./setup.sh
```

Then:
1. Update `backend/.env` with your PostgreSQL credentials
2. Create database: `createdb intune_db`
3. Initialize tables: `cd backend && python init_db.py`
4. Start backend: `cd backend && python run.py`
5. Start frontend: `cd frontend && npm run dev`

### Manual Setup

#### Backend Setup

See [backend/README.md](backend/README.md) for detailed setup instructions.

Quick start:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set up .env file
python init_db.py  # Initialize database
python run.py      # Start server
```

#### Frontend Setup

See [frontend/README.md](frontend/README.md) for detailed setup instructions.

Quick start:
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Configuration, database, security
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Development Status

This is an MVP framework. The backend API structure is complete, and the frontend has the basic page structure. Full functionality and API integration need to be implemented.

## Future Enhancements

- Spotify API integration for automatic music data
- Network graph visualization (D3.js or vis.js)
- Real-time notifications
- Advanced recommendation algorithms
- Music player integration
- Social media sharing

## Contributors

Women In Computing Project Team, UCSD
