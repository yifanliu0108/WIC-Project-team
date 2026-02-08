"""
Connection model for user connections/matches
"""
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, Enum, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class ConnectionStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    BLOCKED = "blocked"


class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connected_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Similarity score calculated between users
    similarity_score = Column(Float, nullable=True)
    
    # Connection status
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.PENDING)
    
    # Recommendation data
    recommended_song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)
    recommendation_message = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="sent_connections")
    connected_user = relationship("User", foreign_keys=[connected_user_id], back_populates="received_connections")
