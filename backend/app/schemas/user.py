"""
User Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    instagram_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    spotify_handle: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    instagram_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    spotify_handle: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    top_genres: Optional[List[str]] = None
    favorite_artists: Optional[List[str]] = None


class UserResponse(UserBase):
    id: int
    profile_picture_url: Optional[str] = None
    top_genres: List[str] = []
    favorite_artists: List[str] = []
    likes_received: int
    connections_made: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """Extended user profile with more details"""
    pass


class UserLogin(BaseModel):
    username: str
    password: str
