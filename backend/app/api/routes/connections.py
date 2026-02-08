"""
Connection routes (make connections, view matches, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.connection import Connection, ConnectionStatus
from app.models.user import User
from app.schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from app.api.routes.auth import get_current_user
from app.services.similarity import calculate_similarity_score

router = APIRouter()


@router.post("/", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    connection_data: ConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new connection request"""
    # Check if user exists
    connected_user = db.query(User).filter(User.id == connection_data.connected_user_id).first()
    if not connected_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if connection already exists
    existing = db.query(Connection).filter(
        Connection.user_id == current_user.id,
        Connection.connected_user_id == connection_data.connected_user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection already exists"
        )
    
    # Calculate similarity score
    similarity_score = calculate_similarity_score(current_user, connected_user, db)
    
    # Create connection
    db_connection = Connection(
        user_id=current_user.id,
        connected_user_id=connection_data.connected_user_id,
        similarity_score=similarity_score,
        recommended_song_id=connection_data.recommended_song_id,
        recommendation_message=connection_data.recommendation_message,
        status=ConnectionStatus.PENDING
    )
    
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    
    return db_connection


@router.get("/me", response_model=List[ConnectionResponse])
async def get_my_connections(
    status_filter: Optional[ConnectionStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's connections"""
    query = db.query(Connection).filter(
        Connection.user_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(Connection.status == status_filter)
    
    connections = query.order_by(Connection.created_at.desc()).all()
    return connections


@router.get("/received", response_model=List[ConnectionResponse])
async def get_received_connections(
    status_filter: Optional[ConnectionStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get connections received by current user"""
    query = db.query(Connection).filter(
        Connection.connected_user_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(Connection.status == status_filter)
    
    connections = query.order_by(Connection.created_at.desc()).all()
    return connections


@router.put("/{connection_id}", response_model=ConnectionResponse)
async def update_connection(
    connection_id: int,
    connection_update: ConnectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update connection status (accept/reject)"""
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.connected_user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    update_data = connection_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(connection, field, value)
    
    # Update statistics if connection is accepted
    if connection_update.status == ConnectionStatus.ACCEPTED:
        connection.user.connections_made += 1
        current_user.likes_received += 1
    
    db.commit()
    db.refresh(connection)
    return connection


@router.get("/stats", response_model=dict)
async def get_connection_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get connection statistics for current user"""
    total_connections = db.query(Connection).filter(
        Connection.user_id == current_user.id,
        Connection.status == ConnectionStatus.ACCEPTED
    ).count()
    
    pending_sent = db.query(Connection).filter(
        Connection.user_id == current_user.id,
        Connection.status == ConnectionStatus.PENDING
    ).count()
    
    pending_received = db.query(Connection).filter(
        Connection.connected_user_id == current_user.id,
        Connection.status == ConnectionStatus.PENDING
    ).count()
    
    return {
        "total_connections": total_connections,
        "pending_sent": pending_sent,
        "pending_received": pending_received,
        "likes_received": current_user.likes_received,
        "connections_made": current_user.connections_made
    }
