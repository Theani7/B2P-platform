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
    password: str = Field(..., min_length=6)
    role: RoleEnum

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
    has_profile: bool

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
    password: str = Field(..., min_length=6)


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class VerifyEmailSchema(BaseModel):
    token: str


class RefreshSchema(BaseModel):
    refresh_token: str
