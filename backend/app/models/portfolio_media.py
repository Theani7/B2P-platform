"""Portfolio media model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base


class PortfolioMedia(Base):
    __tablename__ = "portfolio_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_item_id = Column(UUID(as_uuid=True), ForeignKey("portfolio_items.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    media_type = Column(String(50), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    portfolio_item = relationship("PortfolioItem", back_populates="media")
