"""Review & Rating System service."""
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

from ..models.collaboration import Collaboration, CollaborationStatus
from ..models.review import Review
from ..models.user import User
from ..schemas.review import ReviewRead, ReviewerInfo, RatingSummary, RatingDistribution, ReceivedReviewRead
from app.notifications.service import NotificationService
from app.notifications.schemas import NotificationCreate
from app.notifications.models import NotificationType


def _get_user_info(user: User) -> ReviewerInfo:
    profile = user.promoter_profile or user.business_profile
    avatar = getattr(profile, "avatar_url", None) or getattr(profile, "logo_url", None)
    return ReviewerInfo(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        avatar_url=avatar,
    )


def complete_collaboration(db: Session, user: User, collaboration_id: str) -> Collaboration:
    collab = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not collab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration not found")
    if collab.status != CollaborationStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only active collaborations can be completed")
    user_profile_ids = set()
    if user.business_profile:
        user_profile_ids.add(str(user.business_profile.id))
    if user.promoter_profile:
        user_profile_ids.add(str(user.promoter_profile.id))
    if str(collab.business_profile_id) not in user_profile_ids and str(collab.promoter_profile_id) not in user_profile_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this collaboration")
    collab.status = CollaborationStatus.COMPLETED
    collab.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(collab)

    notification_service = NotificationService(db)
    other_party_id = collab.promoter_profile.user_id if user.business_profile else collab.business_profile.user_id
    notification_service.create_notification(NotificationCreate(
        recipient_id=other_party_id,
        actor_id=user.id,
        type=NotificationType.COLLABORATION_COMPLETED,
        title="Collaboration completed",
        message=f"{user.username} completed the collaboration on '{collab.campaign.title}'",
        entity_type="collaboration",
        entity_id=collab.id,
    ))

    return collab


def create_review(db: Session, user: User, collaboration_id: str, rating: int, comment: Optional[str]) -> Review:
    collab = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not collab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration not found")
    if collab.status != CollaborationStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only review completed collaborations")

    user_bp_id = str(user.business_profile.id) if user.business_profile else None
    user_pp_id = str(user.promoter_profile.id) if user.promoter_profile else None

    is_business = user_bp_id == str(collab.business_profile_id)
    is_promoter = user_pp_id == str(collab.promoter_profile_id)

    if not is_business and not is_promoter:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this collaboration")

    existing = db.query(Review).filter(
        Review.collaboration_id == collab.id,
        Review.reviewer_id == user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this collaboration")

    if is_business:
        promoter_user = db.query(User).join(User.promoter_profile).filter(
            User.promoter_profile.has(id=collab.promoter_profile_id)
        ).first()
        if not promoter_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promoter not found")
        reviewee_id = promoter_user.id
    else:
        business_user = db.query(User).join(User.business_profile).filter(
            User.business_profile.has(id=collab.business_profile_id)
        ).first()
        if not business_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
        reviewee_id = business_user.id

    review = Review(
        collaboration_id=collab.id,
        reviewer_id=user.id,
        reviewee_id=reviewee_id,
        rating=rating,
        comment=comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    notification_service = NotificationService(db)
    notification_service.create_notification(NotificationCreate(
        recipient_id=reviewee_id,
        actor_id=user.id,
        type=NotificationType.REVIEW_RECEIVED,
        title="New review received",
        message=f"You received a {rating}-star review from {user.username}",
        entity_type="review",
        entity_id=review.id,
    ))

    return review


def update_review(db: Session, user: User, review_id: str, rating: Optional[int], comment: Optional[str]) -> Review:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.reviewer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own reviews")

    if rating is not None:
        review.rating = rating
    if comment is not None:
        review.comment = comment

    db.commit()
    db.refresh(review)
    return review


def delete_review(db: Session, user: User, review_id: str) -> None:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.reviewer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own reviews")

    db.delete(review)
    db.commit()


def get_my_reviews(db: Session, user: User, page: int = 1, limit: int = 20) -> Tuple[List[ReviewRead], int]:
    query = db.query(Review).options(
        joinedload(Review.reviewer),
        joinedload(Review.collaboration).joinedload(Collaboration.campaign),
        joinedload(Review.collaboration).joinedload(Collaboration.business_profile)
    ).filter(Review.reviewer_id == user.id)
    total = query.count()
    reviews = query.order_by(desc(Review.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reviews:
        reviewer = r.reviewer
        if not reviewer:
            continue
        business_profile = r.collaboration.business_profile if r.collaboration else None
        campaign = r.collaboration.campaign if r.collaboration else None
        items.append(ReviewRead(
            id=r.id,
            collaboration_id=r.collaboration_id,
            reviewer=_get_user_info(reviewer),
            reviewee_id=r.reviewee_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            updated_at=r.updated_at,
            business_name=business_profile.company_name if business_profile else "Unknown Business",
            campaign_title=campaign.title if campaign else "Unknown Campaign",
        ))
    return items, total


def get_received_reviews(db: Session, user_id: str, page: int = 1, limit: int = 20) -> Tuple[List[ReceivedReviewRead], int]:
    """Get reviews received by a user (where they are the reviewee)."""
    query = db.query(Review).options(
        joinedload(Review.reviewer),
        joinedload(Review.collaboration).joinedload(Collaboration.campaign),
        joinedload(Review.collaboration).joinedload(Collaboration.business_profile)
    ).filter(Review.reviewee_id == user_id)

    total = query.count()
    reviews = query.order_by(desc(Review.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reviews:
        if not r.reviewer:
            continue
        business_profile = r.collaboration.business_profile if r.collaboration else None
        campaign = r.collaboration.campaign if r.collaboration else None
        items.append(ReceivedReviewRead(
            id=r.id,
            collaboration_id=r.collaboration_id,
            reviewer=_get_user_info(r.reviewer),
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            updated_at=r.updated_at,
            business_name=business_profile.company_name if business_profile else "Unknown Business",
            campaign_title=campaign.title if campaign else "Unknown Campaign",
        ))
    return items, total


def get_user_reviews(db: Session, user_id: str, page: int = 1, limit: int = 20) -> Tuple[List[ReviewRead], int]:
    query = db.query(Review).options(joinedload(Review.reviewer)).filter(Review.reviewee_id == user_id)
    total = query.count()
    reviews = query.order_by(desc(Review.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reviews:
        reviewer = r.reviewer
        if not reviewer:
            continue
        items.append(ReviewRead(
            id=r.id,
            collaboration_id=r.collaboration_id,
            reviewer=_get_user_info(reviewer),
            reviewee_id=r.reviewee_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            updated_at=r.updated_at,
        ))
    return items, total


def get_rating_summary(db: Session, user_id: str) -> RatingSummary:
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    total = len(reviews)
    if total == 0:
        return RatingSummary(average_rating=0.0, total_reviews=0, distribution=RatingDistribution())

    distribution = RatingDistribution()
    total_stars = 0
    for r in reviews:
        total_stars += r.rating
        if r.rating == 1:
            distribution.star_1 += 1
        elif r.rating == 2:
            distribution.star_2 += 1
        elif r.rating == 3:
            distribution.star_3 += 1
        elif r.rating == 4:
            distribution.star_4 += 1
        elif r.rating == 5:
            distribution.star_5 += 1

    average = round(total_stars / total, 1)
    return RatingSummary(average_rating=average, total_reviews=total, distribution=distribution)
