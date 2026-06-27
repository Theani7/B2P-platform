from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import settings
from app.core import security
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from .schemas import NotificationResponse, UnreadCountResponse
from .repository import NotificationRepository
from .connection_manager import manager


class PaginatedNotificationsResponse(BaseModel):
    items: list
    total: int
    page: int
    pages: int


router = APIRouter()
ws_router = APIRouter()

@router.get("", response_model=PaginatedNotificationsResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all notifications for the current user."""
    repo = NotificationRepository(db)
    skip = (page - 1) * limit
    items, total = repo.get_by_recipient(recipient_id=current_user.id, skip=skip, limit=limit, unread_only=unread_only)
    return {
        "items": [NotificationResponse.model_validate(item).model_dump() for item in items],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the count of unread notifications."""
    repo = NotificationRepository(db)
    count = repo.get_unread_count(recipient_id=current_user.id)
    return {"count": count}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    repo = NotificationRepository(db)
    notification = repo.mark_as_read(notification_id=notification_id, recipient_id=current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification

@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    repo = NotificationRepository(db)
    updated_count = repo.mark_all_as_read(recipient_id=current_user.id)
    return {"message": "Success", "updated_count": updated_count}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a specific notification."""
    repo = NotificationRepository(db)
    deleted = repo.delete(notification_id=notification_id, recipient_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

def get_user_from_token(token: str, db: Session) -> Optional[User]:
    try:
        payload = security.decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == UUID(user_id)).first()
    except Exception:
        return None

@ws_router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for real-time notifications."""
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    await manager.connect(websocket, user.id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
