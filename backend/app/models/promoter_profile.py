"""Promoter profile model."""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class NicheEnum(str, Enum):
    LIFESTYLE = "LIFESTYLE"
    TECH = "TECH"
    FASHION = "FASHION"
    FOOD = "FOOD"
    TRAVEL = "TRAVEL"
    FITNESS = "FITNESS"
    GAMING = "GAMING"
    BUSINESS = "BUSINESS"
    OTHER = "OTHER"


class PromoterProfile(Base):
    __tablename__ = "promoter_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    username = Column(String(150), nullable=False, unique=True, index=True)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    niche = Column(String(50), nullable=False)
    location = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    followers_count = Column(Integer, default=0, nullable=False)
    engagement_rate = Column(Float, default=0.0, nullable=False)
    years_experience = Column(Integer, nullable=True)
    verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", backref="promoter_profile")
    portfolio_items = relationship("PortfolioItem", back_populates="promoter_profile", cascade="all, delete-orphan")
    social_links = relationship("SocialLink", back_populates="promoter_profile", cascade="all, delete-orphan")