"""Social link schemas."""
from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from uuid import UUID
from app.models.social_link import PlatformEnum

class SocialLinkBase(BaseModel):
    platform: PlatformEnum
    url: HttpUrl
    username: Optional[str] = None
    followers_count: Optional[int] = Field(default=0, ge=0)
    display_order: Optional[int] = Field(default=0, ge=0)

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    username: Optional[str] = None
    followers_count: Optional[int] = Field(default=None, ge=0)
    display_order: Optional[int] = Field(default=None, ge=0)

class SocialLinkResponse(SocialLinkBase):
    id: UUID
    user_id: UUID
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SocialLinkReorder(BaseModel):
    link_ids: List[UUID]
