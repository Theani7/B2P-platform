from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class PortfolioMediaBase(BaseModel):
    file_path: str
    media_type: str
    display_order: int = 0


class PortfolioMediaCreate(PortfolioMediaBase):
    pass


class PortfolioMediaResponse(PortfolioMediaBase):
    id: UUID
    portfolio_item_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


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


class PortfolioItemResponse(PortfolioItemBase):
    id: UUID
    promoter_profile_id: UUID
    created_at: datetime
    updated_at: datetime
    media: List[PortfolioMediaResponse] = []

    class Config:
        from_attributes = True
