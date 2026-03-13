"""
User routes (profile, search, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserProfile, UserUpdate
from app.api.routes.auth import get_current_user

router = APIRouter()


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a user's profile by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's own profile"""
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: Optional[str] = Query(None, description="Search query for username"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for users by username"""
    query = db.query(User).filter(User.id != current_user.id)
    
    if q:
        query = query.filter(User.username.ilike(f"%{q}%"))
    
    users = query.limit(limit).all()
    return users
