"""
Feed routes (activity feed, recommendations, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.connection import Connection, ConnectionStatus
from app.models.user import User
from app.models.song import Song
from app.api.routes.auth import get_current_user
from app.services.recommendation import get_user_recommendations, get_song_recommendations

router = APIRouter()


@router.get("/", response_model=dict)
async def get_feed(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity feed for current user"""
    # Get recent connections
    recent_connections = db.query(Connection).filter(
        (Connection.user_id == current_user.id) | 
        (Connection.connected_user_id == current_user.id),
        Connection.status == ConnectionStatus.ACCEPTED
    ).order_by(Connection.updated_at.desc()).limit(limit).all()
    
    # Get recommended users based on similarity
    # This is a simplified version - you can enhance with better recommendation logic
    all_users = db.query(User).filter(User.id != current_user.id).limit(10).all()
    
    return {
        "recent_connections": [
            {
                "id": conn.id,
                "user_id": conn.user_id if conn.user_id != current_user.id else conn.connected_user_id,
                "similarity_score": conn.similarity_score,
                "created_at": conn.created_at.isoformat()
            }
            for conn in recent_connections
        ],
        "recommended_users": [
            {
                "id": user.id,
                "username": user.username,
                "top_genres": user.top_genres,
                "favorite_artists": user.favorite_artists
            }
            for user in all_users
        ]
    }


@router.get("/recommendations", response_model=List[dict])
async def get_recommendations(
    limit: int = Query(10, ge=1, le=10),  # Max limit is 10
    min_similarity: float = Query(0.0, ge=0.0, le=1.0),  # Default to 0.0 to include all
    exclude_connected: bool = Query(True),
    diversity_factor: float = Query(0.2, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user recommendations using advanced recommendation algorithm
    
    Always returns up to 'limit' recommendations (max 10), even if similarity scores are low.
    This ensures users always have someone to connect with.
    
    Parameters:
    - limit: Maximum number of recommendations (1-10, default: 10)
    - min_similarity: Minimum similarity score threshold (0.0-1.0, default: 0.0 to include all)
    - exclude_connected: Whether to exclude users with existing connections
    - diversity_factor: How much to prioritize diversity vs similarity (0.0-1.0)
    """
    # Ensure limit doesn't exceed 10
    limit = min(limit, 10)
    recommendations = get_user_recommendations(
        current_user=current_user,
        db=db,
        limit=limit,
        min_similarity=min_similarity,
        exclude_connected=exclude_connected,
        diversity_factor=diversity_factor
    )
    
    return recommendations


@router.get("/song-recommendations", response_model=List[dict])
async def get_song_recommendations_endpoint(
    limit: int = Query(10, ge=1, le=20),
    from_connections: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get song recommendations based on:
    - Songs liked by connected users
    - Songs from users with similar taste
    - Popular songs in user's favorite genres
    """
    recommendations = get_song_recommendations(
        current_user=current_user,
        db=db,
        limit=limit,
        from_connections=from_connections
    )
    
    return recommendations
