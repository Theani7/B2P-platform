"""Review & Rating routes - authenticated users."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user
from ....db.session import get_db
from ....schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewRead,
    ReviewListResponse,
    RatingSummary,
    ReceivedReviewRead,
    ReceivedReviewListResponse,
)
from ....services.review import (
    create_review,
    update_review,
    delete_review,
    get_my_reviews,
    get_received_reviews,
    get_user_reviews,
    get_rating_summary,
    complete_collaboration,
)

router = APIRouter(tags=["reviews"])


@router.post("/collaborations/{collaboration_id}/reviews", response_model=ReviewRead, status_code=201)
def create_collaboration_review(
    collaboration_id: str,
    body: ReviewCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    review = create_review(db, user, collaboration_id, body.rating, body.comment)
    return review


@router.put("/reviews/{review_id}", response_model=ReviewRead)
def update_review_endpoint(
    review_id: str,
    body: ReviewUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    review = update_review(db, user, review_id, body.rating, body.comment)
    return review


@router.delete("/reviews/{review_id}", status_code=204)
def delete_review_endpoint(
    review_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    delete_review(db, user, review_id)


@router.get("/my/reviews", response_model=ReviewListResponse)
def my_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_my_reviews(db, user, page=page, limit=limit)
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@router.get("/my/received-reviews", response_model=ReceivedReviewListResponse)
def my_received_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_received_reviews(db, str(user.id), page=page, limit=limit)
    return ReceivedReviewListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@router.get("/users/{user_id}/reviews", response_model=ReviewListResponse)
def user_reviews(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_user_reviews(db, user_id, page=page, limit=limit)
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )


@router.get("/users/{user_id}/rating", response_model=RatingSummary)
def user_rating(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return get_rating_summary(db, user_id)


@router.post("/collaborations/{collaboration_id}/complete", response_model=dict)
def complete_collaboration_endpoint(
    collaboration_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    complete_collaboration(db, user, collaboration_id)
    return {"success": True, "message": "Collaboration completed"}
