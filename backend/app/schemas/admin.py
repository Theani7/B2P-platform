"""Admin schemas."""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


# --- Dashboard ---
class DashboardStats(BaseModel):
    total_users: int = 0
    total_businesses: int = 0
    total_promoters: int = 0
    verified_promoters: int = 0
    total_campaigns: int = 0
    total_applications: int = 0
    total_collaborations: int = 0
    total_reviews: int = 0
    average_rating: float = 0.0
    open_verification_requests: int = 0


# --- User Management ---
class AdminUserRead(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    has_business_profile: bool = False
    has_promoter_profile: bool = False

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    items: List[AdminUserRead]
    total: int
    page: int
    limit: int
    pages: int


# --- Verification ---
class VerificationRequestRead(BaseModel):
    id: uuid.UUID
    promoter_profile_id: uuid.UUID
    promoter_username: str = ""
    promoter_headline: Optional[str] = None
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[uuid.UUID] = None
    admin_notes: Optional[str] = None

    class Config:
        from_attributes = True


class VerificationRequestListResponse(BaseModel):
    items: List[VerificationRequestRead]
    total: int
    page: int
    limit: int
    pages: int


class VerificationAction(BaseModel):
    admin_notes: Optional[str] = None


# --- Campaign Moderation ---
class AdminCampaignRead(BaseModel):
    id: uuid.UUID
    title: str
    business_company_name: str = ""
    category: str
    budget: float
    location: str
    status: str
    visibility: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminCampaignListResponse(BaseModel):
    items: List[AdminCampaignRead]
    total: int
    page: int
    limit: int
    pages: int


# --- Review Moderation ---
class AdminReviewRead(BaseModel):
    id: uuid.UUID
    collaboration_id: uuid.UUID
    reviewer_username: str = ""
    reviewee_username: str = ""
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    is_deleted: bool = False

    class Config:
        from_attributes = True


class AdminReviewListResponse(BaseModel):
    items: List[AdminReviewRead]
    total: int
    page: int
    limit: int
    pages: int


# --- Analytics ---
class AnalyticsData(BaseModel):
    total_users: int = 0
    total_businesses: int = 0
    total_promoters: int = 0
    verified_promoters: int = 0
    total_campaigns: int = 0
    total_applications: int = 0
    total_collaborations: int = 0
    total_reviews: int = 0
    acceptance_rate: float = 0.0
    average_rating: float = 0.0
    top_niches: Dict[str, int] = {}
    top_locations: Dict[str, int] = {}
    top_rated_promoters: List[Dict[str, Any]] = []
    top_businesses: List[Dict[str, Any]] = []
    most_active_promoters: List[Dict[str, Any]] = []
    most_active_businesses: List[Dict[str, Any]] = []


# --- Audit Logs ---
class AuditLogRead(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    username: str = ""
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: List[AuditLogRead]
    total: int
    page: int
    limit: int
    pages: int


# --- Platform Settings ---
class PlatformSettingRead(BaseModel):
    id: str
    setting_key: str
    setting_value: str
    description: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class PlatformSettingUpdate(BaseModel):
    setting_value: str
    description: Optional[str] = None


class PlatformSettingListResponse(BaseModel):
    items: List[PlatformSettingRead]


# --- Verify Promoter (promoter-facing) ---
class VerificationRequestCreate(BaseModel):
    pass
