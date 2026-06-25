from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any
from datetime import datetime
from .models import Achievement, UserAchievement
from .repository import AchievementRepository
from .rules import RuleEngine
from .schemas import AchievementResponse, UserAchievementRead, UserLevelInfo
from app.models.user import User
from app.activity.service import ActivityService
from app.notifications.service import NotificationService
from app.notifications.schemas import NotificationCreate
from app.notifications.models import NotificationType

class AchievementService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = AchievementRepository(session)
        self.rule_engine = RuleEngine(session)
        self.notification_service = NotificationService(session)

    def get_all_achievements(self) -> List[Achievement]:
        return self.repo.get_all()

    def _calculate_level_info(self, user_achievements: List[UserAchievement]) -> UserLevelInfo:
        total_points = sum(ua.achievement.points for ua in user_achievements if ua.earned_at)
        
        # Simple level curve: 0-99 = Level 1, 100-299 = Level 2, 300-599 = Level 3, 600-999 = Level 4...
        level = 1
        points_needed = 100
        current_level_base = 0
        
        while total_points >= points_needed:
            level += 1
            current_level_base = points_needed
            points_needed += level * 100

        current_level_points = total_points - current_level_base
        next_level_points_needed = points_needed - current_level_base
        progress_percentage = min(100.0, max(0.0, (current_level_points / next_level_points_needed) * 100.0))
        
        return UserLevelInfo(
            level=level,
            total_points=total_points,
            current_level_points=current_level_points,
            next_level_points=next_level_points_needed,
            progress_percentage=progress_percentage
        )

    def get_user_achievements_with_level(self, user_id: UUID) -> AchievementResponse:
        user_achs = self.repo.get_user_achievements(user_id)
        all_achs = self.repo.get_all(active_only=True)
        
        # Merge all active achievements with user's progress
        user_ach_map = {ua.achievement_id: ua for ua in user_achs}
        full_list = []
        for ach in all_achs:
            if ach.id in user_ach_map:
                full_list.append(user_ach_map[ach.id])
            else:
                full_list.append(UserAchievement(
                    user_id=user_id,
                    achievement_id=ach.id,
                    achievement=ach,
                    progress=0.0
                ))
                
        level_info = self._calculate_level_info(user_achs)
        return AchievementResponse(
            achievements=[UserAchievementRead.model_validate(ua) for ua in full_list],
            level_info=level_info
        )

    async def recalculate_user_achievements(self, user: User) -> List[UserAchievement]:
        evaluations = self.rule_engine.evaluate_all(user)
        results = []
        for eval_data in evaluations:
            key = eval_data["key"]
            progress = eval_data["progress"]
            
            achievement = self.repo.get_by_key(key)
            if not achievement:
                continue

            user_ach = self.repo.get_user_achievement_by_key(user.id, key)
            if not user_ach:
                user_ach = UserAchievement(
                    user_id=user.id,
                    achievement_id=achievement.id,
                    progress=0.0
                )
                self.session.add(user_ach)
                self.session.commit()
                self.session.refresh(user_ach)

            # If not yet fully earned
            if not user_ach.earned_at and progress >= 100.0:
                user_ach.progress = 100.0
                user_ach.earned_at = datetime.utcnow()
                self.repo.update_user_achievement(user_ach)
                
                # Integration with Activity & Notifications
                ActivityService.record(
                    db=self.session,
                    action="ACHIEVEMENT_UNLOCKED",
                    title=f"Unlocked Badge: {achievement.title}",
                    actor_id=user.id,
                    actor_role=user.role.value if user.role else "USER",
                    entity_type="achievement",
                    entity_id=str(achievement.id)
                )

                notification = NotificationCreate(
                    recipient_id=user.id,
                    type=NotificationType.SYSTEM,
                    title="Achievement Unlocked!",
                    message=f"You have unlocked the {achievement.title} badge.",
                    entity_type="achievement",
                    entity_id=achievement.id
                )
                
                # Special WS payload for achievements
                # Note: this requires notification websocket support which we added earlier.
                # Here we just use the NotificationService which will broadcast NEW_NOTIFICATION.
                # In websocket we check ACHIEVEMENT_UNLOCKED.
                await self.notification_service.create_notification(notification)
                
                from app.notifications.connection_manager import manager as ws_manager
                from .schemas import AchievementRead
                await ws_manager.send_personal_message({
                    "type": "ACHIEVEMENT_UNLOCKED",
                    "data": {
                        "achievement": AchievementRead.model_validate(achievement).model_dump(mode="json")
                    }
                }, user.id)

            elif not user_ach.earned_at and progress > user_ach.progress:
                user_ach.progress = progress
                self.repo.update_user_achievement(user_ach)
            
            results.append(user_ach)
        return results
