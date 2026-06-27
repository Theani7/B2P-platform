"""Collaboration workflow service."""
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from ..models.user import User, RoleEnum
from ..models.business_profile import BusinessProfile
from ..models.promoter_profile import PromoterProfile
from ..models.campaign import Campaign, CampaignStatus, CampaignVisibility
from ..models.campaign_application import CampaignApplication, ApplicationStatus
from ..models.campaign_invitation import CampaignInvitation, InvitationStatus
from ..models.collaboration import Collaboration, CollaborationStatus
from ..schemas.collaboration import (
    CampaignMarketplaceItem,
    CampaignApplicationRead,
    CampaignApplicationWithPromoterRead,
    CampaignApplicationWithCampaignRead,
    CampaignInvitationRead,
    CampaignInvitationWithCampaignRead,
    CollaborationRead,
)


# --- Helpers ---

def _get_business_profile(db: Session, user: User) -> BusinessProfile:
    if user.role != RoleEnum.BUSINESS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only BUSINESS users can perform this action")
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
    return profile


def _get_promoter_profile(db: Session, user: User) -> PromoterProfile:
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users can perform this action")
    profile = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter profile not found")
    return profile


def _get_campaign_for_business(db: Session, campaign_id, business_profile_id) -> Campaign:
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.business_profile_id == business_profile_id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


def _create_collaboration_from_application(db: Session, application: CampaignApplication) -> Collaboration:
    campaign = db.query(Campaign).filter(Campaign.id == application.campaign_id).first()
    collab = Collaboration(
        campaign_id=application.campaign_id,
        business_profile_id=campaign.business_profile_id,
        promoter_profile_id=application.promoter_profile_id,
        application_id=application.id,
        status=CollaborationStatus.ACTIVE,
        started_at=datetime.now(timezone.utc),
    )
    db.add(collab)
    db.commit()
    db.refresh(collab)
    return collab


def _create_collaboration_from_invitation(db: Session, invitation: CampaignInvitation) -> Collaboration:
    campaign = db.query(Campaign).filter(Campaign.id == invitation.campaign_id).first()
    collab = Collaboration(
        campaign_id=invitation.campaign_id,
        business_profile_id=campaign.business_profile_id,
        promoter_profile_id=invitation.promoter_profile_id,
        invitation_id=invitation.id,
        status=CollaborationStatus.ACTIVE,
        started_at=datetime.now(timezone.utc),
    )
    db.add(collab)
    db.commit()
    db.refresh(collab)
    return collab


# --- Marketplace ---

def list_marketplace_campaigns(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort: str = "created_at",
    user: Optional[User] = None,
) -> Tuple[List[CampaignMarketplaceItem], int]:
    query = db.query(Campaign).options(joinedload(Campaign.business_profile)).filter(
        Campaign.visibility == CampaignVisibility.PUBLIC,
        Campaign.status == CampaignStatus.OPEN,
    )

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Campaign.title.ilike(like),
                Campaign.description.ilike(like),
                Campaign.category.ilike(like),
                Campaign.location.ilike(like),
            )
        )

    sort_field = getattr(Campaign, sort, Campaign.created_at)
    query = query.order_by(sort_field.desc())

    total = query.count()
    campaigns = query.offset((page - 1) * limit).limit(limit).all()

    applied_campaign_ids = set()
    bookmarked_campaign_ids = set()
    if user and user.role == RoleEnum.PROMOTER:
        promoter = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
        if promoter:
            from ..models.campaign_application import ApplicationStatus
            apps = db.query(CampaignApplication.campaign_id).filter(
                CampaignApplication.promoter_profile_id == promoter.id,
                CampaignApplication.status != ApplicationStatus.WITHDRAWN
            ).all()
            applied_campaign_ids = {a[0] for a in apps}

            from ..models.saved_campaign import SavedCampaign
            bookmarks = db.query(SavedCampaign.campaign_id).filter(
                SavedCampaign.promoter_profile_id == promoter.id
            ).all()
            bookmarked_campaign_ids = {b[0] for b in bookmarks}

    campaign_ids = [c.id for c in campaigns]
    
    from sqlalchemy import func
    app_counts = db.query(
        CampaignApplication.campaign_id,
        func.count(CampaignApplication.id)
    ).filter(
        CampaignApplication.campaign_id.in_(campaign_ids)
    ).group_by(CampaignApplication.campaign_id).all()
    
    applicant_counts = {c_id: count for c_id, count in app_counts}

    items = []
    for c in campaigns:
        business = c.business_profile
        items.append(CampaignMarketplaceItem(
            id=c.id,
            business_profile_id=c.business_profile_id,
            title=c.title,
            description=c.description,
            category=c.category,
            budget=c.budget,
            location=c.location,
            target_audience=c.target_audience,
            requirements=c.requirements,
            start_date=c.start_date,
            end_date=c.end_date,
            created_at=c.created_at,
            business_name=business.company_name if business else "",
            has_applied=c.id in applied_campaign_ids,
            is_bookmarked=c.id in bookmarked_campaign_ids,
            applicant_count=applicant_counts.get(c.id, 0),
        ))

    return items, total


def toggle_bookmark(db: Session, user: User, campaign_id: str, bookmarked: bool):
    from ..models.promoter_profile import PromoterProfile
    from ..models.saved_campaign import SavedCampaign
    from fastapi import HTTPException
    
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=403, detail="Only promoters can bookmark campaigns")
        
    promoter = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
    if not promoter:
        raise HTTPException(status_code=404, detail="Promoter profile not found")
        
    existing = db.query(SavedCampaign).filter(
        SavedCampaign.promoter_profile_id == promoter.id,
        SavedCampaign.campaign_id == campaign_id
    ).first()
    
    if bookmarked:
        if not existing:
            new_bookmark = SavedCampaign(promoter_profile_id=promoter.id, campaign_id=campaign_id)
            db.add(new_bookmark)
            db.commit()
    else:
        if existing:
            db.delete(existing)
            db.commit()
            
    return {"success": True, "bookmarked": bookmarked}


# --- Applications (Promoter) ---

def apply_to_campaign(db: Session, user: User, campaign_id, payload) -> CampaignApplication:
    promoter = _get_promoter_profile(db, user)

    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.status != CampaignStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign is not open for applications")
    if campaign.visibility != CampaignVisibility.PUBLIC:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign is not accepting applications")

    existing = db.query(CampaignApplication).filter(
        CampaignApplication.campaign_id == campaign_id,
        CampaignApplication.promoter_profile_id == promoter.id,
    ).first()
    if existing:
        from ..models.campaign_application import ApplicationStatus
        if existing.status == ApplicationStatus.WITHDRAWN:
            existing.status = ApplicationStatus.PENDING
            existing.message = payload.message
            existing.created_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this campaign")

    application = CampaignApplication(
        campaign_id=campaign_id,
        promoter_profile_id=promoter.id,
        message=payload.message,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def withdraw_application(db: Session, user: User, application_id) -> None:
    promoter = _get_promoter_profile(db, user)
    application = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
        CampaignApplication.promoter_profile_id == promoter.id,
    ).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only withdraw pending applications")
    application.status = ApplicationStatus.WITHDRAWN
    application.updated_at = datetime.now(timezone.utc)
    db.commit()


def get_promoter_applications(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CampaignApplicationWithCampaignRead], int]:
    promoter = _get_promoter_profile(db, user)
    query = db.query(CampaignApplication).options(joinedload(CampaignApplication.campaign)).filter(
        CampaignApplication.promoter_profile_id == promoter.id,
    )
    total = query.count()
    applications = query.order_by(CampaignApplication.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for app in applications:
        campaign = app.campaign
        items.append(CampaignApplicationWithCampaignRead(
            id=app.id,
            campaign_id=app.campaign_id,
            promoter_profile_id=app.promoter_profile_id,
            message=app.message,
            status=app.status,
            created_at=app.created_at,
            updated_at=app.updated_at,
            campaign_title=campaign.title if campaign else "",
            campaign_category=campaign.category if campaign else "",
            campaign_budget=campaign.budget if campaign else 0.0,
            campaign_location=campaign.location if campaign else "",
            campaign_status=campaign.status.value if campaign else "",
        ))

    return items, total


# --- Applications (Business) ---

def get_campaign_applications(
    db: Session,
    user: User,
    campaign_id,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CampaignApplicationWithPromoterRead], int]:
    business = _get_business_profile(db, user)
    campaign = _get_campaign_for_business(db, campaign_id, business.id)

    query = db.query(CampaignApplication).options(joinedload(CampaignApplication.promoter_profile)).filter(
        CampaignApplication.campaign_id == campaign.id,
    )
    total = query.count()
    applications = query.order_by(CampaignApplication.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for app in applications:
        promoter = app.promoter_profile
        items.append(CampaignApplicationWithPromoterRead(
            id=app.id,
            campaign_id=app.campaign_id,
            promoter_profile_id=app.promoter_profile_id,
            message=app.message,
            status=app.status,
            created_at=app.created_at,
            updated_at=app.updated_at,
            promoter_username=promoter.username if promoter else "",
            promoter_headline=promoter.headline if promoter else None,
            promoter_avatar_url=promoter.avatar_url if promoter else None,
            promoter_niche=promoter.niche if promoter else "",
            promoter_location=promoter.location if promoter else None,
            promoter_followers_count=promoter.followers_count if promoter else 0,
            promoter_engagement_rate=promoter.engagement_rate if promoter else 0.0,
            promoter_years_experience=promoter.years_experience if promoter else None,
            promoter_verified=promoter.verified if promoter else False,
        ))

    return items, total


def accept_application(db: Session, user: User, application_id) -> Collaboration:
    business = _get_business_profile(db, user)
    application = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
    ).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application is not pending")

    campaign = _get_campaign_for_business(db, application.campaign_id, business.id)

    application.status = ApplicationStatus.ACCEPTED
    application.updated_at = datetime.now(timezone.utc)
    db.flush()

    collab = _create_collaboration_from_application(db, application)
    return collab


def reject_application(db: Session, user: User, application_id) -> None:
    business = _get_business_profile(db, user)
    application = db.query(CampaignApplication).filter(
        CampaignApplication.id == application_id,
    ).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application is not pending")

    _get_campaign_for_business(db, application.campaign_id, business.id)

    application.status = ApplicationStatus.REJECTED
    application.updated_at = datetime.now(timezone.utc)
    db.commit()


# --- Invitations (Business) ---

def invite_promoter(db: Session, user: User, campaign_id, promoter_id, payload) -> CampaignInvitation:
    business = _get_business_profile(db, user)
    campaign = _get_campaign_for_business(db, campaign_id, business.id)

    promoter = db.query(PromoterProfile).filter(PromoterProfile.id == promoter_id).first()
    if not promoter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter not found")

    existing = db.query(CampaignInvitation).filter(
        CampaignInvitation.campaign_id == campaign_id,
        CampaignInvitation.promoter_profile_id == promoter_id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Invitation already sent to this promoter")

    invitation = CampaignInvitation(
        campaign_id=campaign_id,
        promoter_profile_id=promoter_id,
        message=payload.message,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def cancel_invitation(db: Session, user: User, invitation_id) -> None:
    business = _get_business_profile(db, user)
    invitation = db.query(CampaignInvitation).filter(
        CampaignInvitation.id == invitation_id,
    ).first()
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    _get_campaign_for_business(db, invitation.campaign_id, business.id)

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only cancel pending invitations")
    db.delete(invitation)
    db.commit()


def get_business_invitations(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CampaignInvitationWithCampaignRead], int]:
    business = _get_business_profile(db, user)
    campaign_ids = db.query(Campaign.id).filter(Campaign.business_profile_id == business.id)

    query = db.query(CampaignInvitation).options(joinedload(CampaignInvitation.campaign)).filter(
        CampaignInvitation.campaign_id.in_(campaign_ids),
    )
    total = query.count()
    invitations = query.order_by(CampaignInvitation.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for inv in invitations:
        campaign = inv.campaign
        items.append(CampaignInvitationWithCampaignRead(
            id=inv.id,
            campaign_id=inv.campaign_id,
            promoter_profile_id=inv.promoter_profile_id,
            message=inv.message,
            status=inv.status,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            campaign_title=campaign.title if campaign else "",
            campaign_category=campaign.category if campaign else "",
            campaign_budget=campaign.budget if campaign else 0.0,
            campaign_location=campaign.location if campaign else "",
            business_name=business.company_name,
        ))

    return items, total


# --- Invitations (Promoter) ---

def get_promoter_invitations(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CampaignInvitationWithCampaignRead], int]:
    promoter = _get_promoter_profile(db, user)
    query = db.query(CampaignInvitation).options(joinedload(CampaignInvitation.campaign).joinedload(Campaign.business_profile)).filter(
        CampaignInvitation.promoter_profile_id == promoter.id,
    )
    total = query.count()
    invitations = query.order_by(CampaignInvitation.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for inv in invitations:
        campaign = inv.campaign
        business = campaign.business_profile if campaign else None
        items.append(CampaignInvitationWithCampaignRead(
            id=inv.id,
            campaign_id=inv.campaign_id,
            promoter_profile_id=inv.promoter_profile_id,
            message=inv.message,
            status=inv.status,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            campaign_title=campaign.title if campaign else "",
            campaign_category=campaign.category if campaign else "",
            campaign_budget=campaign.budget if campaign else 0.0,
            campaign_location=campaign.location if campaign else "",
            business_name=business.company_name if business else "",
        ))

    return items, total


def accept_invitation(db: Session, user: User, invitation_id) -> Collaboration:
    promoter = _get_promoter_profile(db, user)
    invitation = db.query(CampaignInvitation).filter(
        CampaignInvitation.id == invitation_id,
        CampaignInvitation.promoter_profile_id == promoter.id,
    ).first()
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation is not pending")

    invitation.status = InvitationStatus.ACCEPTED
    invitation.updated_at = datetime.now(timezone.utc)
    db.flush()

    collab = _create_collaboration_from_invitation(db, invitation)
    return collab


def reject_invitation(db: Session, user: User, invitation_id) -> None:
    promoter = _get_promoter_profile(db, user)
    invitation = db.query(CampaignInvitation).filter(
        CampaignInvitation.id == invitation_id,
        CampaignInvitation.promoter_profile_id == promoter.id,
    ).first()
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation is not pending")

    invitation.status = InvitationStatus.REJECTED
    invitation.updated_at = datetime.now(timezone.utc)
    db.commit()


# --- Collaborations ---

def get_business_collaborations(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CollaborationRead], int]:
    business = _get_business_profile(db, user)
    query = db.query(Collaboration).options(joinedload(Collaboration.campaign), joinedload(Collaboration.promoter_profile)).filter(
        Collaboration.business_profile_id == business.id,
    )
    total = query.count()
    collaborations = query.order_by(Collaboration.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for collab in collaborations:
        campaign = collab.campaign
        promoter = collab.promoter_profile
        items.append(CollaborationRead(
            id=collab.id,
            campaign_id=collab.campaign_id,
            business_profile_id=collab.business_profile_id,
            promoter_profile_id=collab.promoter_profile_id,
            application_id=collab.application_id,
            invitation_id=collab.invitation_id,
            status=collab.status,
            started_at=collab.started_at,
            completed_at=collab.completed_at,
            created_at=collab.created_at,
            updated_at=collab.updated_at,
            campaign_title=campaign.title if campaign else "",
            campaign_category=campaign.category if campaign else "",
            campaign_budget=campaign.budget if campaign else 0.0,
            campaign_start_date=campaign.start_date if campaign else None,
            campaign_end_date=campaign.end_date if campaign else None,
            partner_name=promoter.username if promoter else "",
            partner_username=promoter.username if promoter else "",
            partner_avatar_url=promoter.avatar_url if promoter else None,
        ))

    return items, total


def get_promoter_collaborations(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[CollaborationRead], int]:
    promoter = _get_promoter_profile(db, user)
    query = db.query(Collaboration).options(joinedload(Collaboration.campaign), joinedload(Collaboration.business_profile)).filter(
        Collaboration.promoter_profile_id == promoter.id,
    )
    total = query.count()
    collaborations = query.order_by(Collaboration.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for collab in collaborations:
        campaign = collab.campaign
        business = collab.business_profile
        items.append(CollaborationRead(
            id=collab.id,
            campaign_id=collab.campaign_id,
            business_profile_id=collab.business_profile_id,
            promoter_profile_id=collab.promoter_profile_id,
            application_id=collab.application_id,
            invitation_id=collab.invitation_id,
            status=collab.status,
            started_at=collab.started_at,
            completed_at=collab.completed_at,
            created_at=collab.created_at,
            updated_at=collab.updated_at,
            campaign_title=campaign.title if campaign else "",
            campaign_category=campaign.category if campaign else "",
            campaign_budget=campaign.budget if campaign else 0.0,
            campaign_start_date=campaign.start_date if campaign else None,
            campaign_end_date=campaign.end_date if campaign else None,
            partner_name=business.company_name if business else "",
            partner_username=business.company_name if business else "",
            partner_avatar_url=business.logo_url if business else None,
        ))

    return items, total
