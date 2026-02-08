"""
Connection Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.connection import ConnectionStatus


class ConnectionBase(BaseModel):
    connected_user_id: int
    recommended_song_id: Optional[int] = None
    recommendation_message: Optional[str] = None


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionUpdate(BaseModel):
    status: Optional[ConnectionStatus] = None
    similarity_score: Optional[float] = None


class ConnectionResponse(ConnectionBase):
    id: int
    user_id: int
    similarity_score: Optional[float] = None
    status: ConnectionStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
