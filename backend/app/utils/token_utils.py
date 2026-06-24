"""Token helpers for verification and password reset."""
import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt

from ..core.config import settings


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)


def generate_reset_token() -> str:
    return jwt.encode(
        {"sub": "reset", "exp": datetime.utcnow() + timedelta(hours=1)},
        settings.SECRET_KEY,
        algorithm="HS256",
    )


def hash_token(token: str) -> str:
    # in production use hash with salt; simplified here
    return token


def is_token_expired(expiry: Optional[datetime]) -> bool:
    if expiry is None:
        return True
    return datetime.utcnow() > expiry
