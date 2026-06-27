"""Notification repository and email digest tests."""
import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from unittest.mock import patch
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine, get_db
from app.notifications.repository import NotificationRepository
from app.notifications.models import Notification, NotificationType
from app.notifications.email_digest import send_daily_digest, _format_digest
from app.models.user import User, RoleEnum


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db() -> Session:
    session = next(get_db())
    yield session
    session.close()


def _create_user(db: Session, email: str = "user@example.com", username: str = "testuser") -> User:
    user = User(
        id=uuid4(),
        username=username,
        full_name="Test User",
        email=email,
        password_hash="hash",
        role=RoleEnum.PROMOTER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_notification(db: Session, recipient_id, actor_id=None, is_read=False) -> Notification:
    notif = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=NotificationType.SYSTEM,
        title="Test notification",
        message="Test message",
        is_read=is_read,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def test_get_unread_since_returns_only_unread(db: Session):
    user = _create_user(db)
    _create_notification(db, user.id, is_read=False)
    _create_notification(db, user.id, is_read=True)

    since = datetime.now(timezone.utc) - timedelta(days=1)
    repo = NotificationRepository(db)
    results = repo.get_unread_since(since)

    assert len(results) == 1
    assert results[0].is_read is False


def test_get_unread_since_by_recipient(db: Session):
    user1 = _create_user(db, email="u1@example.com", username="u1")
    user2 = _create_user(db, email="u2@example.com", username="u2")
    _create_notification(db, user1.id, is_read=False)
    _create_notification(db, user2.id, is_read=False)

    since = datetime.now(timezone.utc) - timedelta(days=1)
    repo = NotificationRepository(db)
    results = repo.get_unread_since_by_recipient(user1.id, since)

    assert len(results) == 1
    assert results[0].recipient_id == user1.id


def test_format_digest():
    class FakeNotif:
        type = "TEST"
        title = "Title"
        message = "Message"

    result = _format_digest([FakeNotif()])
    assert "- TEST: Title" in result
    assert "Message" in result


@pytest.mark.anyio
async def test_send_daily_digest_sends_email(db: Session):
    user = _create_user(db, email="digest@example.com", username="digestuser")
    _create_notification(db, user.id, is_read=False)

    with patch("app.notifications.email_digest.send_email") as mock_send:
        await send_daily_digest(db, user.id)

    mock_send.assert_called_once()
    call_kwargs = mock_send.call_args.kwargs
    assert call_kwargs["to"] == "digest@example.com"
    assert "1 unread notification" in call_kwargs["body"]


@pytest.mark.anyio
async def test_send_daily_digest_skips_user_without_email(db: Session):
    user = _create_user(db, email="noemail@example.com", username="noemail")
    _create_notification(db, user.id, is_read=False)

    original_query = db.query

    def mock_query(*args, **kwargs):
        if args and args[0] == User:
            class FakeResult:
                def filter(self, *a, **kw):
                    return self
                def first(self):
                    return None
            return FakeResult()
        return original_query(*args, **kwargs)

    db.query = mock_query
    with patch("app.notifications.email_digest.send_email") as mock_send:
        await send_daily_digest(db, user.id)

    mock_send.assert_not_called()


@pytest.mark.anyio
async def test_send_daily_digest_skips_when_no_unread(db: Session):
    user = _create_user(db)
    # no unread notifications

    with patch("app.notifications.email_digest.send_email") as mock_send:
        await send_daily_digest(db, user.id)

    mock_send.assert_not_called()
