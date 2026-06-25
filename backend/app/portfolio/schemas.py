from typing import List, Optional, Any, Dict
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
    platforms: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class PortfolioItemCreate(PortfolioItemBase):
    pass

class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    client_name: Optional[str] = Field(None, max_length=255)
    campaign_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    featured: Optional[bool] = None
    platforms: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class PortfolioItemResponse(PortfolioItemBase):
    id: UUID
    promoter_profile_id: UUID
    views: int
    likes: int
    engagement_rate: float
    created_at: datetime
    updated_at: datetime
    media: List[PortfolioMediaResponse] = []

    class Config:
        from_attributes = True
