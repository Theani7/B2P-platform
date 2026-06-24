"""Promoter profile service."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..schemas.promoter_profile import PromoterProfileCreate, PromoterProfileUpdate
from ..models.promoter_profile import PromoterProfile
from ..models.user import User, RoleEnum


def _ensure_promoter(user: User):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users can manage promoter profiles")


def create_or_update(db: Session, user: User, payload: PromoterProfileCreate):
    _ensure_promoter(user)
    # Enforce unique username
    existing = db.query(PromoterProfile).filter(PromoterProfile.username == payload.username, PromoterProfile.user_id != user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    profile = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
    if profile:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    else:
        profile = PromoterProfile(user_id=user.id, **payload.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def get_my_profile(db: Session, user: User):
    _ensure_promoter(user)
    profile = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def delete_profile(db: Session, user: User):
    _ensure_promoter(user)
    profile = db.query(PromoterProfile).filter(PromoterProfile.user_id == user.id).first()
    if profile:
        db.delete(profile)
        db.commit()
    return {"success": True, "message": "Profile deleted"}


def get_public_profile(db: Session, username: str):
    profile = db.query(PromoterProfile).filter(PromoterProfile.username == username).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def search_public_profiles(db: Session, search: str = "", skip: int = 0, limit: int = 20):
    query = db.query(PromoterProfile)
    if search:
        query = query.filter(PromoterProfile.username.ilike(f"%{search}%") | PromoterProfile.headline.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()