"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, users, songs, connections, feed

app = FastAPI(
    title="In Tune API",
    description="Music-based friend-making platform API",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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


@app.get("/")
async def root():
    return {"message": "In Tune API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
