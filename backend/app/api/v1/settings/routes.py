"""Public settings route to fetch platform settings."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.admin import PlatformSettingListResponse
from ....services.admin import get_all_settings

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=PlatformSettingListResponse)
def get_public_settings(db: Session = Depends(get_db)):
    """Fetch global platform settings for frontend dropdowns."""
    items = get_all_settings(db)
    return PlatformSettingListResponse(items=items)
