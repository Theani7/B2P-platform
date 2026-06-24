"""Business logic for authentication flows.

All functions receive a SQLAlchemy Session and return Pydantic schemas
or raise HTTPException on error.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..core import security
from ..models.user import User, RoleEnum
from ..schemas.user import UserCreate, LoginSchema, TokenSchema


def _issue_tokens(user: User) -> TokenSchema:
    access = security.create_access_token(str(user.id), user.role.value)
    refresh = security.create_refresh_token(str(user.id))
    return TokenSchema(access_token=access, refresh_token=refresh)


def register_user(db: Session, payload: UserCreate) -> TokenSchema:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=security.get_password_hash(payload.password),
        role=payload.role,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user)


def login_user(db: Session, payload: LoginSchema) -> TokenSchema:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is deactivated")
    return _issue_tokens(user)


def refresh_token(db: Session, refresh_token: str) -> TokenSchema:
    try:
        data = security.decode_token(refresh_token)
        user_id = data.get("sub")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return _issue_tokens(user)
