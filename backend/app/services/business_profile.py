"""Business profile service."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate
from ..models.business_profile import BusinessProfile
from ..models.user import User, RoleEnum


def _ensure_business(user: User):
    if user.role != RoleEnum.BUSINESS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only BUSINESS users can manage business profiles")


def create_or_update(db: Session, user: User, payload: BusinessProfileCreate):
    _ensure_business(user)
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if profile:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    else:
        profile = BusinessProfile(user_id=user.id, **payload.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def get_my_profile(db: Session, user: User):
    _ensure_business(user)
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def delete_profile(db: Session, user: User):
    _ensure_business(user)
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if profile:
        db.delete(profile)
        db.commit()
    return {"success": True, "message": "Profile deleted"}