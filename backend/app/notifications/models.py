import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class NotificationType(str, enum.Enum):
    APPLICATION_RECEIVED = "APPLICATION_RECEIVED"
    APPLICATION_ACCEPTED = "APPLICATION_ACCEPTED"
    APPLICATION_REJECTED = "APPLICATION_REJECTED"
    INVITATION_RECEIVED = "INVITATION_RECEIVED"
    INVITATION_ACCEPTED = "INVITATION_ACCEPTED"
    INVITATION_DECLINED = "INVITATION_DECLINED"
    NEW_MESSAGE = "NEW_MESSAGE"
    REVIEW_RECEIVED = "REVIEW_RECEIVED"
    COLLABORATION_STARTED = "COLLABORATION_STARTED"
    COLLABORATION_COMPLETED = "COLLABORATION_COMPLETED"
    CAMPAIGN_MATCH_READY = "CAMPAIGN_MATCH_READY"
    SYSTEM = "SYSTEM"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    type = Column(Enum(NotificationType, name="notificationtype"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    metadata = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    recipient = relationship("User", foreign_keys=[recipient_id])
    actor = relationship("User", foreign_keys=[actor_id])
