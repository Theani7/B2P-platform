from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from .schemas import SearchQuery, SearchResponse, SearchHistoryRead
from .service import SearchService

router = APIRouter()

@router.get("/", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=1),
    type: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SearchService(db)
    query = SearchQuery(q=q, type=type, page=page, limit=limit)
    return service.perform_search(query, current_user)

@router.get("/history", response_model=List[SearchHistoryRead])
def get_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SearchService(db)
    return service.repo.get_history(current_user.id)

@router.delete("/history")
def clear_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SearchService(db)
    service.repo.clear_history(current_user.id)
    return {"success": True, "message": "Search history cleared."}
