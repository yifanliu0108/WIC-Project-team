"""
Song model
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Song(Base):
    __tablename__ = "songs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Song information
    title = Column(String(200), nullable=False)
    artist = Column(String(200), nullable=False)
    album = Column(String(200), nullable=True)
    genre = Column(String(100), nullable=True)
    spotify_id = Column(String(100), unique=True, nullable=True)
    
    # User's relationship with the song
    user_rating = Column(Float, nullable=True)  # User's rating 1-5
    is_favorite = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="songs")
