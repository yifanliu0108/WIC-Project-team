"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, users, songs, connections, feed, musicbrainz
from app.models import user, song, connection  # Import models to register them

app = FastAPI(
    title="In Tune API",
    description="Music-based friend-making platform API",
    version="1.0.0"
)

# Auto-initialize database tables on startup
@app.on_event("startup")
async def init_database():
    """Initialize database tables if they don't exist"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables initialized")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")
        # Don't fail startup if tables already exist

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(songs.router, prefix="/api/songs", tags=["songs"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(feed.router, prefix="/api/feed", tags=["feed"])
app.include_router(musicbrainz.router, prefix="/api/musicbrainz", tags=["musicbrainz"])


@app.get("/")
async def root():
    return {"message": "In Tune API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
