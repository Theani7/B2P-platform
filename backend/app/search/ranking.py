from typing import List
from .schemas import SearchResultItem

class RankingEngine:
    @staticmethod
    def score_results(items: List[SearchResultItem], query: str) -> List[SearchResultItem]:
        query_lower = query.lower()
        for item in items:
            score = 0.0
            
            # Exact match in title gets highest score
            if query_lower == item.title.lower():
                score += 100.0
            # Title starts with query
            elif item.title.lower().startswith(query_lower):
                score += 50.0
            # Title contains query
            elif query_lower in item.title.lower():
                score += 25.0
                
            # Subtitle matches
            if item.subtitle:
                if query_lower in item.subtitle.lower():
                    score += 10.0
            
            item.score = score
            
        # Sort by score descending
        items.sort(key=lambda x: x.score, reverse=True)
        return items
