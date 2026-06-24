"""Social link model."""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
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


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False)
    platform = Column(String(20), nullable=False)
    url = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("promoter_profile_id", "platform", name="uq_social_platform"),)

    promoter_profile = relationship("PromoterProfile", back_populates="social_links")