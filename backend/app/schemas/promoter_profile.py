"""Promoter profile schemas."""
import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, validator

class PromoterProfileBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=150)
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    niche: str
    location: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)
    followers_count: int = Field(0, ge=0)
    engagement_rate: float = Field(0.0, ge=0.0, le=100.0)
    years_experience: Optional[int] = Field(None, ge=0)
    verified: bool = False


class PromoterProfileCreate(PromoterProfileBase):
    @validator("username")
    def username_alphanumeric(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username may only contain letters, numbers, underscores, and hyphens")
        return v


class PromoterProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=150)
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    niche: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)
    followers_count: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    years_experience: Optional[int] = Field(None, ge=0)


class PromoterProfileRead(PromoterProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True