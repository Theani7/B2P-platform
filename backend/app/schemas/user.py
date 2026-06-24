"""Pydantic schemas for the auth API.

They mirror the SQLAlchemy model where appropriate and enforce validation
via Zod‑compatible constraints (email format, password length, etc.).
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator

class RoleEnum(str, Enum):
    BUSINESS = "BUSINESS"
    PROMOTER = "PROMOTER"
    ADMIN = "ADMIN"

class UserBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: RoleEnum

    @validator("password")
    def no_space(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        return v

class UserRead(UserBase):
    id: uuid.UUID
    role: RoleEnum
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
