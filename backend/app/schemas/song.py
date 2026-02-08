"""
Song Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    genre: Optional[str] = None
    spotify_id: Optional[str] = None


class SongCreate(SongBase):
    user_rating: Optional[float] = None
    is_favorite: bool = False


class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None
    user_rating: Optional[float] = None
    is_favorite: Optional[bool] = None


class SongResponse(SongBase):
    id: int
    user_id: int
    user_rating: Optional[float] = None
    is_favorite: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
