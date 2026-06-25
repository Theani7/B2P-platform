from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from .schemas import ShareProfileResponse
from .service import SharingService

router = APIRouter()

@router.get("/profile", response_model=ShareProfileResponse)
def get_shareable_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SharingService(db)
    return service.get_share_info(current_user)
