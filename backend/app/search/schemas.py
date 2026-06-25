from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class SearchQuery(BaseModel):
    q: str
    type: Optional[str] = None
    page: int = 1
    limit: int = 10

class SearchResultItem(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Any] = None
    type: str
    url: str
    score: float = 0.0

class SearchResponse(BaseModel):
    campaigns: List[SearchResultItem]
    promoters: List[SearchResultItem]
    businesses: List[SearchResultItem]
    collaborations: List[SearchResultItem]
    messages: List[SearchResultItem]
    users: List[SearchResultItem]

class SearchHistoryRead(BaseModel):
    id: int
    query: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
