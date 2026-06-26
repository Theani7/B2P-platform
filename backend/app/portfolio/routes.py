from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..core.role import RoleEnum
from ..dependencies.auth import require_role
from .schemas import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemResponse, PortfolioMediaResponse
from .service import PortfolioService
from .upload import save_upload_file
from ..models.portfolio_media import PortfolioMedia
from ..models.promoter_profile import PromoterProfile

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

def get_promoter_id(current_user=Depends(require_role(RoleEnum.PROMOTER)), db: Session = Depends(get_db)) -> UUID:
    profile = db.query(PromoterProfile).filter(PromoterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Promoter profile not found")
    return profile.id

@router.post("/", response_model=PortfolioItemResponse)
def create_portfolio_item(
    item_in: PortfolioItemCreate,
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    return service.create_item(promoter_id, item_in)

@router.get("/", response_model=List[PortfolioItemResponse])
def get_portfolio_items(
    skip: int = 0,
    limit: int = 100,
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    return service.get_promoter_items(promoter_id, skip, limit)

@router.get("/{item_id}", response_model=PortfolioItemResponse)
def get_portfolio_item(
    item_id: UUID,
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    return service.get_item(item_id)

@router.patch("/{item_id}", response_model=PortfolioItemResponse)
def update_portfolio_item(
    item_id: UUID,
    item_in: PortfolioItemUpdate,
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    return service.update_item(item_id, promoter_id, item_in)

@router.delete("/{item_id}")
def delete_portfolio_item(
    item_id: UUID,
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    service.delete_item(item_id, promoter_id)
    return {"success": True, "message": "Portfolio item deleted"}

@router.post("/{item_id}/media", response_model=PortfolioMediaResponse)
def upload_portfolio_media(
    item_id: UUID,
    file: UploadFile = File(...),
    is_video: bool = Form(False),
    display_order: int = Form(0),
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    # verify ownership
    service.get_item(item_id) # validates ownership and exists
    item = service.get_item(item_id)
    if item.promoter_profile_id != promoter_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    file_path = save_upload_file(file, is_video)
    
    media = PortfolioMedia(
        portfolio_item_id=item_id,
        file_path=file_path,
        media_type="video" if is_video else "image",
        display_order=display_order
    )
    return service.repo.add_media(media)

@router.delete("/media/{media_id}")
def delete_portfolio_media(
    media_id: UUID,
    promoter_id: UUID = Depends(get_promoter_id),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    media = service.repo.get_media_by_id(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    item = service.get_item(media.portfolio_item_id)
    if item.promoter_profile_id != promoter_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service.repo.delete_media(media)
    return {"success": True, "message": "Media deleted"}
