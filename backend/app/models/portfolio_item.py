"""Portfolio item model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promoter_profile_id = Column(UUID(as_uuid=True), ForeignKey("promoter_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=True)
    campaign_type = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False, nullable=False)
    views = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    engagement_rate = Column(Float, default=0.0, nullable=False)
    platforms = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    promoter_profile = relationship("PromoterProfile", back_populates="portfolio_items")
    media = relationship("PortfolioMedia", back_populates="portfolio_item", cascade="all, delete-orphan", order_by="PortfolioMedia.display_order")
