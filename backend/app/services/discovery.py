"""Discovery service — promoter directory search, public profiles, shortlist."""
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload, contains_eager

from ..models.business_profile import BusinessProfile
from ..models.promoter_profile import PromoterProfile
from ..models.saved_promoter import SavedPromoter
from ..models.user import User, RoleEnum


def _ensure_business_profile(db: Session, user: User) -> BusinessProfile:
    if user.role != RoleEnum.BUSINESS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only business users can perform this action")
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
    return profile


def search_promoters(
    db: Session,
    *,
    search: str = "",
    niche: Optional[str] = None,
    location: Optional[str] = None,
    verified: Optional[bool] = None,
    followers_min: Optional[int] = None,
    followers_max: Optional[int] = None,
    experience_min: Optional[int] = None,
    experience_max: Optional[int] = None,
    sort_by: str = "newest",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[PromoterProfile], int]:
    query = db.query(PromoterProfile)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                PromoterProfile.username.ilike(like),
                PromoterProfile.headline.ilike(like),
                PromoterProfile.bio.ilike(like),
                PromoterProfile.niche.ilike(like),
                PromoterProfile.location.ilike(like),
            )
        )

    if niche:
        query = query.filter(PromoterProfile.niche == niche.upper())
    if location:
        query = query.filter(PromoterProfile.location.ilike(f"%{location}%"))
    if verified is not None:
        query = query.filter(PromoterProfile.verified == verified)
    if followers_min is not None:
        query = query.filter(PromoterProfile.followers_count >= followers_min)
    if followers_max is not None:
        query = query.filter(PromoterProfile.followers_count <= followers_max)
    if experience_min is not None:
        query = query.filter(PromoterProfile.years_experience >= experience_min)
    if experience_max is not None:
        query = query.filter(PromoterProfile.years_experience <= experience_max)

    total = query.count()

    sort_cols = {
        "newest": PromoterProfile.created_at,
        "followers_count": PromoterProfile.followers_count,
        "engagement_rate": PromoterProfile.engagement_rate,
        "years_experience": PromoterProfile.years_experience,
        "username": PromoterProfile.username,
    }
    col = sort_cols.get(sort_by, PromoterProfile.created_at)
    order_fn = col.desc if sort_order == "desc" else col.asc
    query = query.order_by(order_fn())

    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return items, total


def get_public_profile(db: Session, username: str) -> PromoterProfile:
    profile = (
        db.query(PromoterProfile)
        .options(
            joinedload(PromoterProfile.portfolio_items),
            joinedload(PromoterProfile.user).joinedload(User.social_links),
        )
        .filter(PromoterProfile.username == username)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter not found")
    return profile


def save_promoter(db: Session, user: User, promoter_id: str) -> SavedPromoter:
    business = _ensure_business_profile(db, user)

    promoter = db.query(PromoterProfile).filter(PromoterProfile.id == promoter_id).first()
    if not promoter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter not found")

    existing = (
        db.query(SavedPromoter)
        .filter(
            SavedPromoter.business_profile_id == business.id,
            SavedPromoter.promoter_profile_id == promoter_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Promoter already saved")

    saved = SavedPromoter(business_profile_id=business.id, promoter_profile_id=promoter.id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


def remove_saved_promoter(db: Session, user: User, promoter_id: str) -> None:
    business = _ensure_business_profile(db, user)
    saved = (
        db.query(SavedPromoter)
        .filter(
            SavedPromoter.business_profile_id == business.id,
            SavedPromoter.promoter_profile_id == promoter_id,
        )
        .first()
    )
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved promoter not found")
    db.delete(saved)
    db.commit()


def get_saved_promoters(db: Session, user: User, *, search: str = "", page: int = 1, limit: int = 20) -> Tuple[List[SavedPromoter], int]:
    business = _ensure_business_profile(db, user)

    if search:
        like = f"%{search}%"
        query = (
            db.query(SavedPromoter)
            .join(PromoterProfile)
            .options(contains_eager(SavedPromoter.promoter_profile))
            .filter(
                SavedPromoter.business_profile_id == business.id,
                or_(
                    PromoterProfile.username.ilike(like),
                    PromoterProfile.headline.ilike(like),
                    PromoterProfile.niche.ilike(like),
                ),
            )
        )
    else:
        query = (
            db.query(SavedPromoter)
            .options(joinedload(SavedPromoter.promoter_profile))
            .filter(SavedPromoter.business_profile_id == business.id)
        )

    total = query.count()
    offset = (page - 1) * limit
    items = query.order_by(SavedPromoter.created_at.desc()).offset(offset).limit(limit).all()
    return items, total
