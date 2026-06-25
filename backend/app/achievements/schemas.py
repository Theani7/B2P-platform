from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class AchievementBase(BaseModel):
    key: str
    title: str
    description: str
    icon: Optional[str] = None
    category: str
    points: int = 0
    is_active: bool = True

class AchievementCreate(AchievementBase):
    pass

class AchievementRead(AchievementBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserAchievementRead(BaseModel):
    id: int
    user_id: UUID
    achievement_id: int
    earned_at: Optional[datetime] = None
    progress: float
    metadata_: Optional[Dict[str, Any]] = None
    achievement: AchievementRead

    model_config = ConfigDict(from_attributes=True)

class UserLevelInfo(BaseModel):
    level: int
    total_points: int
    current_level_points: int
    next_level_points: int
    progress_percentage: float

class AchievementResponse(BaseModel):
    achievements: List[UserAchievementRead]
    level_info: UserLevelInfo
