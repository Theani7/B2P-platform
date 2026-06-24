"""Portfolio service."""
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..schemas.portfolio_item import PortfolioItemCreate, PortfolioItemUpdate
from ..models.portfolio_item import PortfolioItem
from ..models.promoter_profile import PromoterProfile
from ..models.user import RoleEnum


def _get_promoter_profile(db: Session, user_id: uuid.UUID) -> PromoterProfile:
    return db.query(PromoterProfile).filter(PromoterProfile.user_id == user_id).first()


def create_item(db: Session, user, payload: PortfolioItemCreate):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    profile = _get_promoter_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter profile not found")
    item = PortfolioItem(promoter_profile_id=profile.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_my_items(db: Session, user):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    profile = _get_promoter_profile(db, user.id)
    return profile.portfolio_items if profile else []


def update_item(db: Session, user, item_id: uuid.UUID, payload: PortfolioItemUpdate):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    item = db.query(PortfolioItem).join(PromoterProfile).filter(PortfolioItem.id == item_id, PromoterProfile.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, user, item_id: uuid.UUID):
    if user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only PROMOTER users")
    item = db.query(PortfolioItem).join(PromoterProfile).filter(PortfolioItem.id == item_id, PromoterProfile.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Deleted"}