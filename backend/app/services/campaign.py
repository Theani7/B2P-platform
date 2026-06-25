"""Campaign service with status workflow validation."""
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.campaign import Campaign, CampaignStatus
from ..models.business_profile import BusinessProfile
from ..models.user import User, RoleEnum
from ..schemas.campaign import CampaignCreate, CampaignUpdate

VALID_TRANSITIONS = {
    CampaignStatus.DRAFT: {CampaignStatus.OPEN},
    CampaignStatus.OPEN: {CampaignStatus.ACTIVE},
    CampaignStatus.ACTIVE: {CampaignStatus.COMPLETED},
}


def _get_business_profile(db: Session, user: User) -> BusinessProfile:
    if user.role != RoleEnum.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only BUSINESS users can manage campaigns",
        )
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Create a business profile first.",
        )
    return profile


def _get_campaign(db: Session, campaign_id, business_profile_id) -> Campaign:
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.business_profile_id == business_profile_id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


def _validate_status_transition(current: CampaignStatus, new: CampaignStatus):
    if new in {CampaignStatus.ARCHIVED, CampaignStatus.CANCELLED}:
        return
    allowed = VALID_TRANSITIONS.get(current)
    if allowed is None or new not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {current.value} to {new.value}",
        )


def create_campaign(db: Session, user: User, payload: CampaignCreate) -> Campaign:
    profile = _get_business_profile(db, user)
    campaign = Campaign(
        business_profile_id=profile.id,
        **payload.model_dump(),
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def get_campaign(db: Session, user: User, campaign_id) -> Campaign:
    profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, profile.id)
    return campaign


def list_campaigns(
    db: Session,
    user: User,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    sort: str = "created_at",
) -> Tuple[List[Campaign], int]:
    profile = _get_business_profile(db, user)
    query = db.query(Campaign).filter(Campaign.business_profile_id == profile.id)

    if search:
        like = f"%{search}%"
        query = query.filter(
            Campaign.title.ilike(like) | Campaign.description.ilike(like)
        )

    sort_field = getattr(Campaign, sort, Campaign.created_at)
    query = query.order_by(sort_field.desc())

    total = query.count()
    campaigns = query.offset((page - 1) * limit).limit(limit).all()
    return campaigns, total


def update_campaign(db: Session, user: User, campaign_id, payload: CampaignUpdate) -> Campaign:
    profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, profile.id)

    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] != campaign.status:
        _validate_status_transition(campaign.status, update_data["status"])

    for field, value in update_data.items():
        setattr(campaign, field, value)

    campaign.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(campaign)
    return campaign


def delete_campaign(db: Session, user: User, campaign_id) -> None:
    profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, profile.id)
    db.delete(campaign)
    db.commit()


def archive_campaign(db: Session, user: User, campaign_id) -> Campaign:
    return update_campaign(
        db, user, campaign_id,
        CampaignUpdate(status=CampaignStatus.ARCHIVED),
    )


def reopen_campaign(db: Session, user: User, campaign_id) -> Campaign:
    profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, profile.id)
    if campaign.status != CampaignStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only archived campaigns can be reopened",
        )
    campaign.status = CampaignStatus.DRAFT
    campaign.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(campaign)
    return campaign


def get_dashboard_stats(db: Session, user: User) -> dict:
    profile = _get_business_profile(db, user)
    total = db.query(func.count(Campaign.id)).filter(Campaign.business_profile_id == profile.id).scalar()
    open_count = db.query(func.count(Campaign.id)).filter(Campaign.business_profile_id == profile.id, Campaign.status == CampaignStatus.OPEN).scalar()
    active_count = db.query(func.count(Campaign.id)).filter(Campaign.business_profile_id == profile.id, Campaign.status == CampaignStatus.ACTIVE).scalar()
    completed_count = db.query(func.count(Campaign.id)).filter(Campaign.business_profile_id == profile.id, Campaign.status == CampaignStatus.COMPLETED).scalar()
    recent = db.query(Campaign).filter(Campaign.business_profile_id == profile.id).order_by(Campaign.created_at.desc()).limit(5).all()

    return {
        "total_campaigns": total,
        "open_campaigns": open_count,
        "active_campaigns": active_count,
        "completed_campaigns": completed_count,
        "recent_campaigns": [
            {
                "id": str(c.id),
                "title": c.title,
                "status": c.status.value,
                "budget": c.budget,
                "created_at": c.created_at.isoformat(),
            }
            for c in recent
        ],
    }
