"""Smart Matching routes - business only."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....db.session import get_db
from ....schemas.matching import MatchResultListResponse, MatchGenerateResponse
from ....services.matching import generate_matches, get_matches

router = APIRouter(prefix="/campaigns/{campaign_id}", tags=["matching"], dependencies=[Depends(require_role(Role.BUSINESS))])


@router.post("/generate-matches", response_model=MatchGenerateResponse)
def generate_campaign_matches(
    campaign_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    count = generate_matches(db, user, campaign_id)
    return MatchGenerateResponse(
        success=True,
        message=f"Generated {count} match results",
        total_matches=count,
    )


@router.get("/matches", response_model=MatchResultListResponse)
def campaign_matches(
    campaign_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    classification: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    verified: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_matches(
        db, user, campaign_id,
        page=page, limit=limit,
        classification=classification,
        min_score=min_score,
        verified=verified,
    )
    return MatchResultListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )
