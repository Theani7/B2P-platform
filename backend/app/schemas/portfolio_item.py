"""Portfolio item schema."""
import uuid
from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, Field


class PortfolioItemBase(BaseModel):
    title: str = Field(..., max_length=255)
    client_name: Optional[str] = Field(None, max_length=255)
    campaign_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    featured: bool = False
    views: int = Field(0, ge=0)
    likes: int = Field(0, ge=0)
    engagement_rate: float = Field(0.0, ge=0.0, le=100.0)
    platforms: Optional[List[Any]] = None
    tags: Optional[List[Any]] = None


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    client_name: Optional[str] = Field(None, max_length=255)
    campaign_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    featured: Optional[bool] = None
    views: Optional[int] = Field(None, ge=0)
    likes: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    platforms: Optional[List[Any]] = None
    tags: Optional[List[Any]] = None


class PortfolioItemRead(PortfolioItemBase):
    id: uuid.UUID
    promoter_profile_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True