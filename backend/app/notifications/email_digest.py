from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from uuid import UUID

from .repository import NotificationRepository
from app.models.user import User
from app.utils.email import send_email


def _get_users_with_unread(db: Session, since: datetime) -> list[UUID]:
    repo = NotificationRepository(db)
    results = repo.get_unread_since(since)
    user_ids = {r.recipient_id for r in results}
    return list(user_ids)


def _get_unread_for_user(db: Session, user_id: UUID, since: datetime):
    repo = NotificationRepository(db)
    return repo.get_unread_since_by_recipient(user_id, since)


def _format_digest(notifications) -> str:
    lines = []
    for n in notifications:
        lines.append(f"- {n.type}: {n.title}\n  {n.message}")
    return "\n".join(lines)


async def send_daily_digest(db: Session, trigger_user_id: Optional[UUID] = None):
    since = datetime.now(timezone.utc) - timedelta(days=1)
    user_ids = _get_users_with_unread(db, since) if trigger_user_id is None else [trigger_user_id]
    for uid in user_ids:
        notifs = _get_unread_for_user(db, uid, since)
        if not notifs:
            continue
        user = db.query(User).filter(User.id == uid).first()
        if not user or not user.email:
            continue
        body = _format_digest(notifs)
        try:
            send_email(
                to=user.email,
                subject="Your daily notification digest",
                body=f"Hi {user.username},\n\nYou have {len(notifs)} unread notification(s):\n\n{body}\n\nVisit the app to view them.",
            )
        except Exception as e:
            print(f"Failed to send digest to {user.email}: {e}")
