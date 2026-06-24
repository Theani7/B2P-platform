"""Social links service."""
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..schemas.social_link import SocialLinkCreate, SocialLinkUpdate
from ..models.social_link import SocialLink, PlatformEnum
from ..models.promoter_profile import PromoterProfile
from ..models.user import RoleEnum


def _get_promoter_profile(db: Session, user_id: uuid.UUID):
    return db.query(PromoterProfile).filter(PromoterProfile.user_id == user_id).first()


def create_link(db: Session, user, payload: SocialLinkCreate):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    profile = _get_promoter_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter profile not found")
    existing = db.query(SocialLink).filter(SocialLink.promoter_profile_id == profile.id, SocialLink.platform == payload.platform).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Social link already exists for this platform")
    link = SocialLink(promoter_profile_id=profile.id, **payload.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def get_my_links(db: Session, user):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    profile = _get_promoter_profile(db, user.id)
    return profile.social_links if profile else []


def update_link(db: Session, user, link_id: uuid.UUID, payload: SocialLinkUpdate):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    link = db.query(SocialLink).join(PromoterProfile).filter(SocialLink.id == link_id, PromoterProfile.user_id == user.id).first()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    db.commit()
    db.refresh(link)
    return link


def delete_link(db: Session, user, link_id: uuid.UUID):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    link = db.query(SocialLink).join(PromoterProfile).filter(SocialLink.id == link_id, PromoterProfile.user_id == user.id).first()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    db.delete(link)
    db.commit()
    return {"success": True, "message": "Deleted"}