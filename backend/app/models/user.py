"""
User model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Social media handles
    instagram_handle = Column(String(100), nullable=True)
    twitter_handle = Column(String(100), nullable=True)
    spotify_handle = Column(String(100), nullable=True)
    
    # Profile information
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    
    # Music preferences (stored as JSON for flexibility)
    top_genres = Column(JSON, default=list)
    favorite_artists = Column(JSON, default=list)
    
    # Statistics
    likes_received = Column(Integer, default=0)
    connections_made = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    songs = relationship("Song", back_populates="user", cascade="all, delete-orphan")
    sent_connections = relationship("Connection", foreign_keys="Connection.user_id", back_populates="user")
    received_connections = relationship("Connection", foreign_keys="Connection.connected_user_id", back_populates="connected_user")
