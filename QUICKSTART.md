# Quick Start Guide

Get In Tune up and running in minutes!

## Prerequisites

- **Python 3.9+** installed
- **Node.js 16+** and **npm** installed
- **PostgreSQL** installed and running

## Quick Setup (Automated)

Run the setup script from the project root:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Set up the backend virtual environment and install dependencies
- Set up the frontend and install npm packages
- Create a `.env` file with default settings

## Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and update:
   # - DATABASE_URL with your PostgreSQL credentials
   # - SECRET_KEY (generate a random string)
   ```

5. **Create PostgreSQL database:**
   ```bash
   createdb intune_db
   # Or using psql:
   # psql -U postgres
   # CREATE DATABASE intune_db;
   ```

6. **Initialize database tables:**
   ```bash
   python init_db.py
   ```

7. **Start the backend server:**
   ```bash
   python run.py
   # Or: uvicorn app.main:app --reload --port 8000
   ```

   Backend will be available at: `http://localhost:8000`
   API docs at: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:3000`

## Using the Application

1. **Start both servers:**
   - Terminal 1: Backend (`cd backend && python run.py`)
   - Terminal 2: Frontend (`cd frontend && npm run dev`)

2. **Access the application:**
   - Open `http://localhost:3000` in your browser
   - You'll see the Login page

3. **Register a new account:**
   - Click "Register" on the login page
   - Fill in username, email, password
   - Optionally add social media handles
   - Submit the form

4. **Navigate using the sidebar:**
   - **Dashboard**: Main page with network graph, search, profile cards, top songs
   - **Feed**: Activity feed and notifications
   - **Profile**: Your profile with songs, artists, genres, albums, and stats

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── init_db.py    # Database initialization
│   ├── run.py        # Server startup script
│   └── setup.sh      # Backend setup script
├── frontend/         # React frontend
│   ├── src/          # Source code
│   └── setup.sh      # Frontend setup script
└── setup.sh          # Full project setup
```

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env` matches your PostgreSQL setup
- Verify database exists: `psql -l | grep intune_db`

### Port Already in Use
- Backend: Change port in `run.py` or use `--port` flag
- Frontend: Vite will automatically use next available port

### Module Not Found
- Backend: Make sure virtual environment is activated
- Frontend: Run `npm install` again

### CORS Errors
- Make sure backend CORS_ORIGINS in `.env` includes frontend URL
- Default: `http://localhost:3000,http://localhost:5173`

## Next Steps

- Integrate frontend with backend API (use `src/utils/api.js`)
- Implement network graph visualization
- Add Spotify API integration
- Enhance similarity algorithm
- Add real-time notifications

## Development Tips

- Backend API docs: `http://localhost:8000/docs` (Swagger UI)
- Backend alternative docs: `http://localhost:8000/redoc`
- Frontend hot reload: Changes auto-reload in browser
- Backend auto-reload: Changes auto-reload server (with `--reload` flag)
