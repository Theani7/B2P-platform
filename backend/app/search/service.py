from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.models.user import User, RoleEnum
from .schemas import SearchQuery, SearchResponse, SearchResultItem
from .repository import SearchRepository
from .ranking import RankingEngine

class SearchService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SearchRepository(session)
        self.ranking = RankingEngine()

    def perform_search(self, query: SearchQuery, user: User) -> SearchResponse:
        self.repo.add_history(user.id, query.q)
        
        limit = query.limit
        results = {
            "campaigns": [],
            "promoters": [],
            "businesses": [],
            "collaborations": [],
            "messages": [],
            "users": []
        }

        # Campaigns
        if not query.type or query.type == "campaign":
            camps = self.repo.search_campaigns(query.q, limit)
            for c in camps:
                # Basic role check - Admins see all, others see ACTIVE or their own
                if user.role == RoleEnum.ADMIN or c.status == "ACTIVE" or c.business_profile_id == getattr(user.business_profile, 'id', None):
                    results["campaigns"].append(SearchResultItem(
                        id=str(c.id),
                        title=c.title,
                        subtitle=c.status,
                        type="campaign",
                        url=f"/business/campaigns/{c.id}" if user.role == RoleEnum.BUSINESS else f"/promoter/campaigns/{c.id}"
                    ))

        # Promoters
        if not query.type or query.type == "promoter":
            proms = self.repo.search_promoters(query.q, limit)
            for p in proms:
                results["promoters"].append(SearchResultItem(
                    id=str(p.id),
                    title=p.username,
                    subtitle=p.niche,
                    image_url=p.avatar_url,
                    type="promoter",
                    url=f"/business/promoters/{p.username}" if user.role == RoleEnum.BUSINESS else f"/promoter/profile"
                ))

        # Businesses
        if not query.type or query.type == "business":
            bizes = self.repo.search_businesses(query.q, limit)
            for b in bizes:
                results["businesses"].append(SearchResultItem(
                    id=str(b.id),
                    title=b.company_name,
                    subtitle=b.industry,
                    image_url=b.logo_url,
                    type="business",
                    url=f"/business/profile"
                ))

        # Users (Admin only)
        if user.role == RoleEnum.ADMIN and (not query.type or query.type == "user"):
            users = self.repo.search_users(query.q, limit)
            for u in users:
                results["users"].append(SearchResultItem(
                    id=str(u.id),
                    title=u.full_name or u.email,
                    subtitle=u.role.value,
                    type="user",
                    url=f"/admin/users/{u.id}"
                ))

        # Apply Ranking
        for k in results.keys():
            if results[k]:
                results[k] = self.ranking.score_results(results[k], query.q)

        return SearchResponse(**results)
