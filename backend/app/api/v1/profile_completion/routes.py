from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, RoleEnum
from app.profile_completion.schemas import ProfileCompletionResponse
from app.profile_completion.service import ProfileCompletionService

router = APIRouter()

@router.get("/business", response_model=ProfileCompletionResponse)
def get_business_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.BUSINESS:
        raise HTTPException(status_code=403, detail="Not a business user")
    
    service = ProfileCompletionService()
    return service.get_business_completion(current_user)

@router.get("/promoter", response_model=ProfileCompletionResponse)
def get_promoter_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.PROMOTER:
        raise HTTPException(status_code=403, detail="Not a promoter user")
    
    service = ProfileCompletionService()
    return service.get_promoter_completion(current_user)
