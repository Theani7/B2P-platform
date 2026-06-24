"""Authentication endpoints for Sprint 1.

All routes return JWT token pairs (access + refresh) and user data where appropriate.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...dependencies.auth import get_current_user, require_role
from ...db.session import get_db
from ...schemas.user import UserCreate, LoginSchema, TokenSchema, UserRead
from ...services.auth import register_user, login_user, refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, payload)

@router.post("/login", response_model=TokenSchema)
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    return login_user(db, payload)

@router.post("/refresh", response_model=TokenSchema)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    return refresh_token(db, refresh_token)

@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    # Stateless JWT – client discards tokens
    return {"message": "Logged out"}

@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
