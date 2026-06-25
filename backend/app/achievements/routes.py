from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.core.role import RoleEnum
from .schemas import AchievementRead, AchievementResponse
from .service import AchievementService

router = APIRouter()

@router.get("/", response_model=List[AchievementRead])
def get_achievements(db: Session = Depends(get_db)):
    service = AchievementService(db)
    return service.get_all_achievements()

@router.get("/me", response_model=AchievementResponse)
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.get_user_achievements_with_level(current_user.id)

@router.get("/users/{user_id}/achievements", response_model=AchievementResponse)
def get_user_achievements(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.get_user_achievements_with_level(user_id)

@router.post("/recalculate")
async def recalculate_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.ADMIN))
):
    service = AchievementService(db)
    # Note: For large DBs, this should be a background task (e.g. Celery).
    users = db.query(User).filter(User.is_active == True).all()
    count = 0
    for u in users:
        await service.recalculate_user_achievements(u)
        count += 1
    return {"success": True, "message": f"Recalculated achievements for {count} users."}
