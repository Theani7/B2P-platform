"""Social link schema."""
import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, validator


class PlatformEnum(str, Enum):
    INSTAGRAM = "INSTAGRAM"
    TIKTOK = "TIKTOK"
    YOUTUBE = "YOUTUBE"
    FACEBOOK = "FACEBOOK"
    LINKEDIN = "LINKEDIN"
    X = "X"
    GITHUB = "GITHUB"
    WEBSITE = "WEBSITE"


class SocialLinkBase(BaseModel):
    platform: PlatformEnum
    url: str = Field(..., max_length=500)


class SocialLinkCreate(SocialLinkBase):
    @validator("url")
    def valid_url(cls, v):
        if not v.startswith(("http://", "https://")):
            raise ValueError("Must be a valid HTTP/HTTPS URL")
        return v


class SocialLinkUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=500)

    @validator("url")
    def valid_url(cls, v):
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("Must be a valid HTTP/HTTPS URL")
        return v


class SocialLinkRead(SocialLinkBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True