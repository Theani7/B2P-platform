"""Matching schemas for Smart Matching System."""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class MatchClassification(str):
    EXCELLENT = "EXCELLENT_MATCH"
    GOOD = "GOOD_MATCH"
    AVERAGE = "AVERAGE_MATCH"
    LOW = "LOW_MATCH"


class ScoreBreakdown(BaseModel):
    niche: int = 0
    location: int = 0
    followers: int = 0
    experience: int = 0
    engagement: int = 0


class MatchResultPromoter(BaseModel):
    id: uuid.UUID
    username: str
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    niche: str
    location: Optional[str] = None
    followers_count: int
    engagement_rate: float
    years_experience: Optional[int] = None
    verified: bool

    class Config:
        from_attributes = True


class MatchResultRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter: MatchResultPromoter
    score: float
    classification: str
    score_breakdown: Dict[str, Any]
    created_at: datetime
    explanation: str

    class Config:
        from_attributes = True


class MatchResultListResponse(BaseModel):
    items: List[MatchResultRead]
    total: int
    page: int
    limit: int
    pages: int


class MatchGenerateResponse(BaseModel):
    success: bool
    message: str
    total_matches: int
