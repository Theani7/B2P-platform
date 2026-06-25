from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from uuid import UUID
from datetime import datetime

from app.models.search_history import SearchHistory
from app.models.campaign import Campaign
from app.models.promoter_profile import PromoterProfile
from app.models.business_profile import BusinessProfile
from app.models.collaboration import Collaboration
from app.models.chat import Conversation, Message
from app.models.user import User

class SearchRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_history(self, user_id: UUID, query: str):
        # Delete old if > 10
        history_count = self.session.query(SearchHistory).filter(SearchHistory.user_id == user_id).count()
        if history_count >= 10:
            oldest = self.session.query(SearchHistory).filter(SearchHistory.user_id == user_id).order_by(SearchHistory.created_at.asc()).first()
            if oldest:
                self.session.delete(oldest)
        
        # Insert new
        new_hist = SearchHistory(user_id=user_id, query=query)
        self.session.add(new_hist)
        self.session.commit()

    def get_history(self, user_id: UUID) -> List[SearchHistory]:
        return self.session.query(SearchHistory).filter(SearchHistory.user_id == user_id).order_by(SearchHistory.created_at.desc()).all()

    def clear_history(self, user_id: UUID):
        self.session.query(SearchHistory).filter(SearchHistory.user_id == user_id).delete()
        self.session.commit()

    def search_campaigns(self, query: str, limit: int) -> List[Campaign]:
        return self.session.query(Campaign).filter(
            or_(
                Campaign.title.ilike(f"%{query}%"),
                Campaign.description.ilike(f"%{query}%")
            )
        ).limit(limit).all()

    def search_promoters(self, query: str, limit: int) -> List[PromoterProfile]:
        return self.session.query(PromoterProfile).filter(
            or_(
                PromoterProfile.username.ilike(f"%{query}%"),
                PromoterProfile.headline.ilike(f"%{query}%"),
                PromoterProfile.niche.ilike(f"%{query}%")
            )
        ).limit(limit).all()

    def search_businesses(self, query: str, limit: int) -> List[BusinessProfile]:
        return self.session.query(BusinessProfile).filter(
            or_(
                BusinessProfile.company_name.ilike(f"%{query}%"),
                BusinessProfile.industry.ilike(f"%{query}%")
            )
        ).limit(limit).all()

    def search_users(self, query: str, limit: int) -> List[User]:
        return self.session.query(User).filter(
            or_(
                User.full_name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        ).limit(limit).all()
