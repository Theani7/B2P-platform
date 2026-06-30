"""Discovery schemas for promoter directory and shortlist."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from .social_link import SocialLinkRead
from app.portfolio.schemas import PortfolioItemResponse


class PromoterDirectoryItem(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    username: str
    headline: Optional[str] = None
    niche: str
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    followers_count: int
    engagement_rate: float
    years_experience: Optional[int] = None
    verified: bool
    average_rating: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


class PromoterDirectoryResponse(BaseModel):
    items: List[PromoterDirectoryItem]
    total: int
    page: int
    limit: int
    pages: int


class PromoterPublicProfileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    username: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    niche: str
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    followers_count: int
    engagement_rate: float
    years_experience: Optional[int] = None
    verified: bool
    average_rating: float = 0.0
    portfolio_items: List[PortfolioItemResponse] = []
    social_links: List[SocialLinkRead] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SavedPromoterRead(BaseModel):
    id: uuid.UUID
    business_profile_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    promoter: PromoterDirectoryItem
    created_at: datetime

    class Config:
        from_attributes = True
