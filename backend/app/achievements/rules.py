from typing import Dict, Any, List
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User, RoleEnum
from app.models.portfolio_item import PortfolioItem
from app.models.social_link import SocialLink

class RuleEngine:
    """Evaluates business and promoter rules independently."""

    def __init__(self, session: Session):
        self.session = session

    def evaluate_all(self, user: User) -> List[Dict[str, Any]]:
        achievements_earned = []
        if user.role == RoleEnum.BUSINESS:
            achievements_earned.extend(self._evaluate_business_rules(user))
        elif user.role == RoleEnum.PROMOTER:
            achievements_earned.extend(self._evaluate_promoter_rules(user))
            
        achievements_earned.extend(self._evaluate_general_rules(user))
        return achievements_earned

    def _evaluate_general_rules(self, user: User) -> List[Dict[str, Any]]:
        earned = []
        # Profile completion rule
        if user.role == RoleEnum.PROMOTER:
            if hasattr(user, 'promoter_profile') and user.promoter_profile:
                earned.append({"key": "COMPLETE_PROFILE", "progress": 100.0})
        elif user.role == RoleEnum.BUSINESS:
            if hasattr(user, 'business_profile') and user.business_profile:
                earned.append({"key": "COMPLETE_BUSINESS_PROFILE", "progress": 100.0})
                
        # Social links
        social_links = self.session.query(SocialLink).filter(SocialLink.user_id == user.id).count()
        if social_links > 0:
            earned.append({"key": "FIRST_SOCIAL_LINK", "progress": 100.0})
            
        return earned

    def _evaluate_business_rules(self, user: User) -> List[Dict[str, Any]]:
        earned = []
        # Add rules based on existing models here if needed.
        return earned

    def _evaluate_promoter_rules(self, user: User) -> List[Dict[str, Any]]:
        earned = []
        # Check portfolio items
        portfolios = 0
        if hasattr(user, 'promoter_profile') and user.promoter_profile:
            portfolios = self.session.query(PortfolioItem).filter(PortfolioItem.promoter_id == user.promoter_profile.id).count()
        if portfolios > 0:
            earned.append({"key": "FIRST_PORTFOLIO", "progress": 100.0})
        return earned
