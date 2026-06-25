"""Authentication service with lockout, verification, reset, rotation, and blacklist."""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..core import security
from ..core.role import Role
from ..models.user import User, RoleEnum
from ..schemas.user import (
    ForgotPasswordSchema,
    LoginSchema,
    ResetPasswordSchema,
    TokenSchema,
    UserCreate,
    VerifyEmailSchema,
)


def _tokens(user: User) -> TokenSchema:
    return TokenSchema(
        access_token=security.create_access_token(str(user.id), user.role.value),
        refresh_token=security.create_refresh_token(str(user.id)),
    )


def _increment_failed(db: Session, user: User) -> None:
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= 5:
        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.add(user)
    db.commit()


def _reset_failed(db: Session, user: User) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()


def register(db: Session, payload: UserCreate) -> TokenSchema:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    verification_token = secrets.token_urlsafe(32)
    verification_expiry = datetime.now(timezone.utc) + timedelta(hours=24)

    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=security.get_password_hash(payload.password),
        role=RoleEnum(payload.role.value),
        is_active=True,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expiry=verification_expiry,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    from ..utils.email import send_verification_email
    send_verification_email(user.email, verification_token)
    return _tokens(user)


def login(db: Session, payload: LoginSchema) -> TokenSchema:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.locked_until and datetime.now(timezone.utc) < user.locked_until.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account temporarily locked due to failed attempts")
    if not security.verify_password(payload.password, user.password_hash):
        _increment_failed(db, user)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is deactivated")
    _reset_failed(db, user)
    return _tokens(user)


def refresh(db: Session, refresh_token: str) -> TokenSchema:
    from ..utils.token_utils import hash_token
    from ..models.revoked_token import RevokedRefreshToken
    token_hash = hash_token(refresh_token)
    if db.query(RevokedRefreshToken).filter(RevokedRefreshToken.token_hash == token_hash).first():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")
    try:
        data = security.decode_token(refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = data.get("sub")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    # rotate token: revoke old, issue new
    db.add(RevokedRefreshToken(token_hash=token_hash, expires_at=datetime.now(timezone.utc) + timedelta(days=7)))
    db.commit()
    return _tokens(user)


def verify_email(db: Session, payload: VerifyEmailSchema) -> None:
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token")
    if user.is_verified:
        return
    if user.verification_token_expiry and datetime.now(timezone.utc) > user.verification_token_expiry.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token expired")
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None
    db.add(user)
    db.commit()


def forgot_password(db: Session, payload: ForgotPasswordSchema) -> None:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return
    reset_token = secrets.token_urlsafe(32)
    user.verification_token = reset_token
    user.verification_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    db.add(user)
    db.commit()
    from ..utils.email import send_password_reset_email
    send_password_reset_email(user.email, reset_token)


def reset_password(db: Session, payload: ResetPasswordSchema) -> None:
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token")
    if user.verification_token_expiry and datetime.now(timezone.utc) > user.verification_token_expiry.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token expired")
    user.password_hash = security.get_password_hash(payload.new_password)
    user.verification_token = None
    user.verification_token_expiry = None
    user.failed_login_attempts = 0
    user.locked_until = None
    db.add(user)
    db.commit()
