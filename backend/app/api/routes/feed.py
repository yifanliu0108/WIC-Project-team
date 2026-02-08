"""
Feed routes (activity feed, recommendations, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.connection import Connection, ConnectionStatus
from app.models.user import User
from app.models.song import Song
from app.api.routes.auth import get_current_user

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
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user recommendations based on music taste similarity"""
    # Get all other users
    all_users = db.query(User).filter(User.id != current_user.id).all()
    
    recommendations = []
    for user in all_users:
        # Calculate similarity (simplified - you can enhance this)
        common_genres = set(current_user.top_genres or []) & set(user.top_genres or [])
        common_artists = set(current_user.favorite_artists or []) & set(user.favorite_artists or [])
        
        similarity = (len(common_genres) + len(common_artists)) / max(
            len(current_user.top_genres or []) + len(current_user.favorite_artists or []), 1
        )
        
        # Check if connection already exists
        existing = db.query(Connection).filter(
            ((Connection.user_id == current_user.id) & (Connection.connected_user_id == user.id)) |
            ((Connection.user_id == user.id) & (Connection.connected_user_id == current_user.id))
        ).first()
        
        if not existing and similarity > 0:
            recommendations.append({
                "user_id": user.id,
                "username": user.username,
                "similarity_score": similarity,
                "common_genres": list(common_genres),
                "common_artists": list(common_artists),
                "top_songs": [
                    {
                        "id": song.id,
                        "title": song.title,
                        "artist": song.artist
                    }
                    for song in db.query(Song).filter(
                        Song.user_id == user.id,
                        Song.is_favorite == True
                    ).limit(3).all()
                ]
            })
    
    # Sort by similarity and return top results
    recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)
    return recommendations[:limit]
