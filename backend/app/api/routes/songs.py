"""
Song routes (add songs, get top songs, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.song import Song
from app.models.user import User
from app.schemas.song import SongCreate, SongResponse, SongUpdate
from app.api.routes.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
async def add_song(
    song_data: SongCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a song to user's collection"""
    db_song = Song(
        user_id=current_user.id,
        **song_data.model_dump()
    )
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    return db_song


@router.get("/me", response_model=List[SongResponse])
async def get_my_songs(
    limit: int = Query(50, ge=1, le=100),
    favorite_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's songs"""
    query = db.query(Song).filter(Song.user_id == current_user.id)
    
    if favorite_only:
        query = query.filter(Song.is_favorite == True)
    
    songs = query.order_by(Song.created_at.desc()).limit(limit).all()
    return songs


@router.get("/user/{user_id}", response_model=List[SongResponse])
async def get_user_songs(
    user_id: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get songs from a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    songs = db.query(Song).filter(
        Song.user_id == user_id
    ).order_by(Song.created_at.desc()).limit(limit).all()
    
    return songs


@router.get("/top", response_model=List[SongResponse])
async def get_top_songs(
    user_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top songs (favorites or highest rated) for a user"""
    target_user_id = user_id if user_id else current_user.id
    
    songs = db.query(Song).filter(
        Song.user_id == target_user_id,
        Song.is_favorite == True
    ).order_by(
        Song.user_rating.desc().nulls_last()
    ).limit(limit).all()
    
    return songs


@router.put("/{song_id}", response_model=SongResponse)
async def update_song(
    song_id: int,
    song_update: SongUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a song"""
    song = db.query(Song).filter(
        Song.id == song_id,
        Song.user_id == current_user.id
    ).first()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    update_data = song_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(song, field, value)
    
    db.commit()
    db.refresh(song)
    return song


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a song"""
    song = db.query(Song).filter(
        Song.id == song_id,
        Song.user_id == current_user.id
    ).first()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    db.delete(song)
    db.commit()
    return None
