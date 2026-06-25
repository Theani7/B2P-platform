"""Pydantic schemas with strong validation and response envelope fields."""
import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


from ..core.role import Role as RoleEnum


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=150)
    full_name: str = Field(..., max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=12)
    role: RoleEnum

    @validator("password")
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must include at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        return v

    @validator("username")
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username may only contain letters, numbers, and underscores")
        return v


class UserRead(UserBase):
    id: uuid.UUID
    role: RoleEnum
    is_active: bool
    is_verified: bool
    failed_login_attempts: int
    locked_until: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12)

    @validator("new_password")
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must include at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        return v


class VerifyEmailSchema(BaseModel):
    token: str


class RefreshSchema(BaseModel):
    refresh_token: str
