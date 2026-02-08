# In Tune - Backend API

FastAPI backend for the In Tune music-based friend-making platform.

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **JWT**: Authentication using JSON Web Tokens
- **Pydantic**: Data validation and settings management

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL database
- pip (Python package manager)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

4. Create the database:
```bash
# Make sure PostgreSQL is running
# Create database: createdb intune_db
```

5. Initialize the database (run this in Python):
```python
from app.core.database import engine
from app.models.user import User
from app.models.song import Song
from app.models.connection import Connection
from app.core.database import Base

Base.metadata.create_all(bind=engine)
```

6. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/profile/{user_id}` - Get user profile
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/search` - Search users

### Songs
- `POST /api/songs/` - Add a song
- `GET /api/songs/me` - Get current user's songs
- `GET /api/songs/user/{user_id}` - Get user's songs
- `GET /api/songs/top` - Get top songs
- `PUT /api/songs/{song_id}` - Update a song
- `DELETE /api/songs/{song_id}` - Delete a song

### Connections
- `POST /api/connections/` - Create a connection
- `GET /api/connections/me` - Get my connections
- `GET /api/connections/received` - Get received connections
- `PUT /api/connections/{connection_id}` - Update connection status
- `GET /api/connections/stats` - Get connection statistics

### Feed
- `GET /api/feed/` - Get activity feed
- `GET /api/feed/recommendations` - Get user recommendations

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── songs.py
│   │       ├── connections.py
│   │       └── feed.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── song.py
│   │   └── connection.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── song.py
│   │   └── connection.py
│   ├── services/
│   │   └── similarity.py
│   └── main.py
├── requirements.txt
└── .env.example
```

## Development Notes

- All endpoints require authentication except `/api/auth/register` and `/api/auth/login`
- Use the access token from login in the Authorization header: `Bearer <token>`
- Similarity scores are calculated based on common genres, artists, and songs
- The database models support future enhancements like Spotify integration
