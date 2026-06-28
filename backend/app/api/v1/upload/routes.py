"""Media upload routes."""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....db.session import get_db
from ....utils.upload import save_upload

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    url = save_upload(file, "avatars")
    return {"success": True, "data": {"url": url}}


@router.post("/logo")
async def upload_logo(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != Role.BUSINESS:
        raise HTTPException(status_code=403, detail="Only BUSINESS users can upload logos")
    url = save_upload(file, "logos")
    return {"success": True, "data": {"url": url}}


@router.post("/portfolio-image")
async def upload_portfolio_image(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    url = save_upload(file, "portfolio")
    return {"success": True, "data": {"url": url}}