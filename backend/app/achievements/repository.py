from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from .models import Achievement, UserAchievement

class AchievementRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all(self, active_only: bool = True) -> List[Achievement]:
        query = self.session.query(Achievement)
        if active_only:
            query = query.filter(Achievement.is_active == True)
        return query.all()

    def get_by_key(self, key: str) -> Optional[Achievement]:
        return self.session.query(Achievement).filter(Achievement.key == key).first()

    def get_user_achievements(self, user_id: UUID) -> List[UserAchievement]:
        return self.session.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()

    def get_user_achievement_by_key(self, user_id: UUID, key: str) -> Optional[UserAchievement]:
        return self.session.query(UserAchievement).join(Achievement).filter(
            UserAchievement.user_id == user_id,
            Achievement.key == key
        ).first()

    def update_user_achievement(self, user_ach: UserAchievement):
        self.session.add(user_ach)
        self.session.commit()
        self.session.refresh(user_ach)
        return user_ach
