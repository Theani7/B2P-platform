"""Admin service with audit logging."""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, Request, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session, joinedload

from ..models.audit_log import AuditLog
from ..models.business_profile import BusinessProfile
from ..models.campaign import Campaign
from ..models.campaign_application import CampaignApplication
from ..models.collaboration import Collaboration, CollaborationStatus
from ..models.platform_setting import PlatformSetting
from ..models.promoter_profile import PromoterProfile
from ..models.review import Review
from ..models.user import User, RoleEnum
from ..models.verification_request import VerificationRequest, VerificationStatus
from ..schemas.admin import (
    DashboardStats,
    AnalyticsData,
    AdminUserRead,
    AdminCampaignRead,
    AdminReviewRead,
    VerificationRequestRead,
    AuditLogRead,
    PlatformSettingRead,
)


# --- Audit Log Helper ---
def log_action(
    db: Session,
    user_id: Optional[str],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    request: Optional[Request] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent", "") if request else None,
        extra_data=metadata,
    )
    db.add(log)
    db.commit()
    return log


# --- Dashboard ---
def get_dashboard_stats(db: Session) -> DashboardStats:
    total_users = db.query(User).count()
    total_businesses = db.query(User).filter(User.role == RoleEnum.BUSINESS).count()
    total_promoters = db.query(User).filter(User.role == RoleEnum.PROMOTER).count()
    verified_promoters = db.query(PromoterProfile).filter(PromoterProfile.verified == True).count()
    total_campaigns = db.query(Campaign).count()
    total_applications = db.query(CampaignApplication).count()
    total_collaborations = db.query(Collaboration).count()
    total_reviews = db.query(Review).count()

    avg_rating = db.query(func.avg(Review.rating)).scalar() or 0.0
    open_verifications = db.query(VerificationRequest).filter(
        VerificationRequest.status == VerificationStatus.PENDING
    ).count()

    return DashboardStats(
        total_users=total_users,
        total_businesses=total_businesses,
        total_promoters=total_promoters,
        verified_promoters=verified_promoters,
        total_campaigns=total_campaigns,
        total_applications=total_applications,
        total_collaborations=total_collaborations,
        total_reviews=total_reviews,
        average_rating=round(float(avg_rating), 1),
        open_verification_requests=open_verifications,
    )


# --- User Management ---
def get_admin_users(
    db: Session,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Tuple[List[AdminUserRead], int]:
    query = db.query(User).options(joinedload(User.business_profile), joinedload(User.promoter_profile))
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            User.username.ilike(pattern) | User.full_name.ilike(pattern) | User.email.ilike(pattern)
        )
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for u in users:
        items.append(AdminUserRead(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            email=u.email,
            role=u.role.value if hasattr(u.role, "value") else str(u.role),
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at,
            last_login_at=u.last_login_at,
            has_business_profile=u.business_profile is not None,
            has_promoter_profile=u.promoter_profile is not None,
        ))
    return items, total


def get_admin_user_detail(db: Session, user_id: str) -> AdminUserRead:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return AdminUserRead(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        has_business_profile=user.business_profile is not None,
        has_promoter_profile=user.promoter_profile is not None,
    )


def suspend_user(db: Session, user_id: str, admin_user_id: str, request: Request) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot suspend admin users")
    user.is_active = False
    db.commit()
    log_action(db, admin_user_id, "USER_SUSPENDED", "user", user_id, request)
    return user


def activate_user(db: Session, user_id: str, admin_user_id: str, request: Request) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    log_action(db, admin_user_id, "USER_ACTIVATED", "user", user_id, request)
    return user


def soft_delete_user(db: Session, user_id: str, admin_user_id: str, request: Request) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete admin users")
    db.delete(user)
    db.commit()
    log_action(db, admin_user_id, "USER_DELETED", "user", user_id, request)


# --- Verification ---
def get_verification_requests(
    db: Session,
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
) -> Tuple[List[VerificationRequestRead], int]:
    query = db.query(VerificationRequest).options(joinedload(VerificationRequest.promoter_profile))
    if status_filter:
        query = query.filter(VerificationRequest.status == status_filter)
    total = query.count()
    reqs = query.order_by(VerificationRequest.submitted_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reqs:
        profile = r.promoter_profile
        items.append(VerificationRequestRead(
            id=r.id,
            promoter_profile_id=r.promoter_profile_id,
            promoter_username=profile.username if profile else "",
            promoter_headline=profile.headline if profile else None,
            status=r.status.value if hasattr(r.status, "value") else str(r.status),
            submitted_at=r.submitted_at,
            reviewed_at=r.reviewed_at,
            reviewed_by=r.reviewed_by,
            admin_notes=r.admin_notes,
        ))
    return items, total


def approve_verification(db: Session, request_id: str, admin_user: User, admin_notes: Optional[str], req: Request) -> VerificationRequest:
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == request_id).first()
    if not vr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification request not found")
    if vr.status != VerificationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

    vr.status = VerificationStatus.APPROVED
    vr.reviewed_at = datetime.now(timezone.utc)
    vr.reviewed_by = admin_user.id
    vr.admin_notes = admin_notes

    profile = db.query(PromoterProfile).filter(PromoterProfile.id == vr.promoter_profile_id).first()
    if profile:
        profile.verified = True

    db.commit()
    log_action(db, admin_user.id, "VERIFICATION_APPROVED", "verification_request", request_id, req)
    return vr


def reject_verification(db: Session, request_id: str, admin_user: User, admin_notes: Optional[str], req: Request) -> VerificationRequest:
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == request_id).first()
    if not vr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification request not found")
    if vr.status != VerificationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

    vr.status = VerificationStatus.REJECTED
    vr.reviewed_at = datetime.now(timezone.utc)
    vr.reviewed_by = admin_user.id
    vr.admin_notes = admin_notes

    db.commit()
    log_action(db, admin_user.id, "VERIFICATION_REJECTED", "verification_request", request_id, req)
    return vr


def revoke_verification(db: Session, promoter_profile_id: str, admin_user: User, req: Request) -> None:
    profile = db.query(PromoterProfile).filter(PromoterProfile.id == promoter_profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter not found")
    profile.verified = False
    db.commit()
    log_action(db, admin_user.id, "VERIFICATION_REVOKED", "promoter", promoter_profile_id, req)


def submit_verification_request(db: Session, user: User) -> VerificationRequest:
    if not user.promoter_profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No promoter profile found")
    if user.promoter_profile.verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already verified")

    existing = db.query(VerificationRequest).filter(
        VerificationRequest.promoter_profile_id == user.promoter_profile.id,
        VerificationRequest.status == VerificationStatus.PENDING,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Pending request already exists")

    vr = VerificationRequest(promoter_profile_id=user.promoter_profile.id)
    db.add(vr)
    db.commit()
    db.refresh(vr)
    return vr


# --- Campaign Moderation ---
def get_admin_campaigns(
    db: Session,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> Tuple[List[AdminCampaignRead], int]:
    query = db.query(Campaign).options(joinedload(Campaign.business_profile))
    if search:
        pattern = f"%{search}%"
        query = query.filter(Campaign.title.ilike(pattern))
    if status_filter:
        query = query.filter(Campaign.status == status_filter)

    total = query.count()
    campaigns = query.order_by(Campaign.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for c in campaigns:
        biz = c.business_profile
        items.append(AdminCampaignRead(
            id=c.id,
            title=c.title,
            business_company_name=biz.company_name if biz else "",
            category=c.category,
            budget=c.budget,
            location=c.location,
            status=c.status.value if hasattr(c.status, "value") else str(c.status),
            visibility=c.visibility.value if hasattr(c.visibility, "value") else str(c.visibility),
            created_at=c.created_at,
        ))
    return items, total


def archive_campaign_admin(db: Session, campaign_id: str, admin_user: User, req: Request) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    campaign.status = "ARCHIVED"
    db.commit()
    log_action(db, admin_user.id, "CAMPAIGN_ARCHIVED", "campaign", campaign_id, req)
    return campaign


def cancel_campaign_admin(db: Session, campaign_id: str, admin_user: User, req: Request) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    campaign.status = "CANCELLED"
    db.commit()
    log_action(db, admin_user.id, "CAMPAIGN_CANCELLED", "campaign", campaign_id, req)
    return campaign


# --- Review Moderation ---
def get_admin_reviews(
    db: Session,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
) -> Tuple[List[AdminReviewRead], int]:
    query = db.query(Review).options(joinedload(Review.reviewer), joinedload(Review.reviewee))
    if search:
        pattern = f"%{search}%"
        query = query.filter(Review.comment.ilike(pattern))
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reviews:
        reviewer = r.reviewer
        reviewee = r.reviewee
        items.append(AdminReviewRead(
            id=r.id,
            collaboration_id=r.collaboration_id,
            reviewer_username=reviewer.username if reviewer else "",
            reviewee_username=reviewee.username if reviewee else "",
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return items, total


def delete_review_admin(db: Session, review_id: str, admin_user: User, req: Request) -> None:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()
    log_action(db, admin_user.id, "REVIEW_DELETED", "review", review_id, req)


# --- Audit Logs ---
def get_audit_logs(
    db: Session,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> Tuple[List[AuditLogRead], int]:
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if search:
        pattern = f"%{search}%"
        query = query.filter(AuditLog.action.ilike(pattern) | AuditLog.entity_type.ilike(pattern))
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if date_from:
        query = query.filter(AuditLog.created_at >= date_from)
    if date_to:
        query = query.filter(AuditLog.created_at <= date_to)

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for log in logs:
        username = log.user.username if log.user else ""
        items.append(AuditLogRead(
            id=log.id,
            user_id=log.user_id,
            username=username,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            ip_address=log.ip_address,
            metadata=log.extra_data,
            created_at=log.created_at,
        ))
    return items, total


# --- Platform Settings ---
def get_all_settings(db: Session) -> List[PlatformSettingRead]:
    settings = db.query(PlatformSetting).order_by(PlatformSetting.setting_key).all()
    return [
        PlatformSettingRead(
            id=str(s.id),
            setting_key=s.setting_key,
            setting_value=s.setting_value,
            description=s.description,
            updated_at=s.updated_at,
        )
        for s in settings
    ]


def update_setting(db: Session, setting_key: str, setting_value: str, description: Optional[str]) -> PlatformSetting:
    setting = db.query(PlatformSetting).filter(PlatformSetting.setting_key == setting_key).first()
    if not setting:
        from ..models.platform_setting import PlatformSetting as PSModel
        import uuid
        setting = PSModel(id=str(uuid.uuid4()), setting_key=setting_key, setting_value=setting_value, description=description)
        db.add(setting)
    else:
        setting.setting_value = setting_value
        if description is not None:
            setting.description = description
    db.commit()
    db.refresh(setting)
    return setting


def seed_default_settings(db: Session) -> None:
    defaults = [
        ("campaign_categories", "TECH,FASHION,FOOD,TRAVEL,FITNESS,LIFESTYLE,GAMING,BUSINESS,HEALTH,EDUCATION,ENTERTAINMENT,OTHER", "Available campaign categories"),
        ("industries", "TECH,FINANCE,HEALTH,RETAIL,FOOD,TRAVEL,EDUCATION,ENTERTAINMENT,REAL_ESTATE,FASHION,OTHER", "Available business industries"),
        ("promoter_niches", "LIFESTYLE,TECH,FASHION,FOOD,TRAVEL,FITNESS,GAMING,BUSINESS,OTHER", "Available promoter niches"),
        ("max_portfolio_items", "20", "Maximum portfolio items per promoter"),
        ("max_upload_size_mb", "10", "Maximum file upload size in MB"),
        ("platform_name", "Byparsathy", "Platform display name"),
        ("support_email", "support@b2pconnect.com", "Platform support email address"),
    ]
    for key, value, desc in defaults:
        existing = db.query(PlatformSetting).filter(PlatformSetting.setting_key == key).first()
        if not existing:
            import uuid
            db.add(PlatformSetting(
                id=str(uuid.uuid4()),
                setting_key=key,
                setting_value=value,
                description=desc,
            ))
    db.commit()


# --- Analytics ---
def get_analytics(db: Session) -> AnalyticsData:
    total_users = db.query(User).count()
    total_businesses = db.query(User).filter(User.role == RoleEnum.BUSINESS).count()
    total_promoters = db.query(User).filter(User.role == RoleEnum.PROMOTER).count()
    verified_promoters = db.query(PromoterProfile).filter(PromoterProfile.verified == True).count()
    total_campaigns = db.query(Campaign).count()
    total_applications = db.query(CampaignApplication).count()
    total_collaborations = db.query(Collaboration).count()
    total_reviews = db.query(Review).count()

    avg_rating = db.query(func.avg(Review.rating)).scalar() or 0.0

    accepted = db.query(Collaboration).filter(Collaboration.status == CollaborationStatus.ACTIVE).count()
    total_invites = total_collaborations
    acceptance_rate = round((accepted / total_invites * 100) if total_invites > 0 else 0, 1)

    niches = db.query(PromoterProfile.niche, func.count(PromoterProfile.id).label("count")).group_by(PromoterProfile.niche).order_by(desc("count")).limit(10).all()
    top_niches = {n: c for n, c in niches}

    locations = db.query(Campaign.location, func.count(Campaign.id).label("count")).group_by(Campaign.location).order_by(desc("count")).limit(10).all()
    top_locations = {l: c for l, c in locations}

    return AnalyticsData(
        total_users=total_users,
        total_businesses=total_businesses,
        total_promoters=total_promoters,
        verified_promoters=verified_promoters,
        total_campaigns=total_campaigns,
        total_applications=total_applications,
        total_collaborations=total_collaborations,
        total_reviews=total_reviews,
        acceptance_rate=acceptance_rate,
        average_rating=round(float(avg_rating), 1),
        top_niches=top_niches,
        top_locations=top_locations,
    )
