"""Social link model."""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class PlatformEnum(str, Enum):
    INSTAGRAM = "INSTAGRAM"
    TIKTOK = "TIKTOK"
    YOUTUBE = "YOUTUBE"
    FACEBOOK = "FACEBOOK"
    LINKEDIN = "LINKEDIN"
    X = "X"
    GITHUB = "GITHUB"
    WEBSITE = "WEBSITE"


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)
    username = Column(String(255), nullable=True)
    url = Column(String(500), nullable=False)
    followers_count = Column(Integer, default=0, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "platform", name="uq_social_user_platform"),)

    user = relationship("User", back_populates="social_links")
