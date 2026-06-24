"""Campaign marketplace routes - public campaigns browseable by any authenticated user."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user
from ....schemas.collaboration import CampaignMarketplaceResponse
from ....services.collaboration import list_marketplace_campaigns
from ....db.session import get_db

router = APIRouter(prefix="/campaign-marketplace", tags=["campaign-marketplace"])


@router.get("", response_model=CampaignMarketplaceResponse)
def marketplace(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = list_marketplace_campaigns(db, search=search, page=page, limit=limit, sort=sort)
    return CampaignMarketplaceResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
    )
