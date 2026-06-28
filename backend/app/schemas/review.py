"""Review schemas for Review & Rating System."""
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewerInfo(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewRead(BaseModel):
    id: uuid.UUID
    collaboration_id: uuid.UUID
    reviewer: ReviewerInfo
    reviewee_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    business_name: str = ""
    campaign_title: str = ""

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    items: List[ReviewRead]
    total: int
    page: int
    limit: int
    pages: int


class ReceivedReviewRead(BaseModel):
    id: uuid.UUID
    collaboration_id: uuid.UUID
    reviewer: ReviewerInfo
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    business_name: str
    campaign_title: str

    class Config:
        from_attributes = True


class ReceivedReviewListResponse(BaseModel):
    items: List[ReceivedReviewRead]
    total: int
    page: int
    limit: int
    pages: int


class RatingDistribution(BaseModel):
    star_1: int = 0
    star_2: int = 0
    star_3: int = 0
    star_4: int = 0
    star_5: int = 0


class RatingSummary(BaseModel):
    average_rating: float = 0.0
    total_reviews: int = 0
    distribution: RatingDistribution

    class Config:
        from_attributes = True
