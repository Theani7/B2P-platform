"""Collaboration workflow schemas."""
import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from ..models.campaign_application import ApplicationStatus
from ..models.campaign_invitation import InvitationStatus
from ..models.collaboration import CollaborationStatus


# --- Marketplace ---

class CampaignMarketplaceItem(BaseModel):
    id: uuid.UUID
    business_profile_id: uuid.UUID
    title: str
    description: str
    category: str
    budget: float
    location: str
    target_audience: Optional[str] = None
    requirements: Optional[str] = None
    start_date: datetime
    end_date: datetime
    created_at: datetime
    business_name: str = ""
    has_applied: bool = False
    is_bookmarked: bool = False
    applicant_count: int = 0

    class Config:
        from_attributes = True


class CampaignMarketplaceResponse(BaseModel):
    items: List[CampaignMarketplaceItem]
    total: int
    page: int
    limit: int
    pages: int


# --- Applications ---

class CampaignApplicationCreate(BaseModel):
    message: Optional[str] = None


class CampaignApplicationRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignApplicationWithPromoterRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    promoter_username: str = ""
    promoter_headline: Optional[str] = None
    promoter_avatar_url: Optional[str] = None
    promoter_niche: str = ""
    promoter_location: Optional[str] = None
    promoter_followers_count: int = 0
    promoter_engagement_rate: float = 0.0
    promoter_years_experience: Optional[int] = None
    promoter_verified: bool = False

    class Config:
        from_attributes = True


class CampaignApplicationWithCampaignRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    campaign_title: str = ""
    campaign_category: str = ""
    campaign_budget: float = 0.0
    campaign_location: str = ""
    campaign_status: str = ""
    business_name: str = ""

    class Config:
        from_attributes = True


class CampaignApplicationFullRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    
    # Promoter details
    promoter_username: str = ""
    promoter_avatar_url: Optional[str] = None
    
    # Campaign details
    campaign_title: str = ""

    class Config:
        from_attributes = True


class CampaignApplicationListResponse(BaseModel):
    items: List
    total: int
    page: int
    limit: int
    pages: int


# --- Invitations ---

class CampaignInvitationCreate(BaseModel):
    message: Optional[str] = None


class CampaignInvitationRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: InvitationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignInvitationWithCampaignRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    message: Optional[str] = None
    status: InvitationStatus
    created_at: datetime
    updated_at: datetime
    campaign_title: str = ""
    campaign_category: str = ""
    campaign_budget: float = 0.0
    campaign_location: str = ""
    business_name: str = ""

    class Config:
        from_attributes = True


class CampaignInvitationListResponse(BaseModel):
    items: List
    total: int
    page: int
    limit: int
    pages: int


# --- Collaborations ---

class CollaborationRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    business_profile_id: uuid.UUID
    promoter_profile_id: uuid.UUID
    application_id: Optional[uuid.UUID] = None
    invitation_id: Optional[uuid.UUID] = None
    status: CollaborationStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    campaign_title: str = ""
    campaign_category: str = ""
    campaign_budget: float = 0.0
    campaign_start_date: Optional[datetime] = None
    campaign_end_date: Optional[datetime] = None
    partner_name: str = ""
    partner_username: str = ""
    partner_avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class CollaborationListResponse(BaseModel):
    items: List[CollaborationRead]
    total: int
    page: int
    limit: int
    pages: int
