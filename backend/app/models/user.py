"""User model with extended enterprise fields."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class RoleEnum(str, enum.Enum):
    BUSINESS = "BUSINESS"
    PROMOTER = "PROMOTER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(150), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True)
    verification_token_expiry = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)
    promoter_profile = relationship("PromoterProfile", back_populates="user", uselist=False)
    social_links = relationship("SocialLink", back_populates="user", cascade="all, delete-orphan", order_by="SocialLink.display_order")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

    @property
    def has_profile(self) -> bool:
        if self.role == RoleEnum.ADMIN:
            return True
        if self.role == RoleEnum.BUSINESS:
            return self.business_profile is not None
        if self.role == RoleEnum.PROMOTER:
            return self.promoter_profile is not None
        return False

