from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..models.portfolio_item import PortfolioItem
from ..models.portfolio_media import PortfolioMedia

class PortfolioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, item_id: UUID) -> Optional[PortfolioItem]:
        return self.db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()

    def get_by_promoter(self, promoter_id: UUID, skip: int = 0, limit: int = 100) -> List[PortfolioItem]:
        return self.db.query(PortfolioItem).filter(PortfolioItem.promoter_profile_id == promoter_id).offset(skip).limit(limit).all()

    def count_featured(self, promoter_id: UUID) -> int:
        return self.db.query(PortfolioItem).filter(
            PortfolioItem.promoter_profile_id == promoter_id,
            PortfolioItem.featured == True
        ).count()

    def create(self, item: PortfolioItem) -> PortfolioItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: PortfolioItem) -> PortfolioItem:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: PortfolioItem):
        self.db.delete(item)
        self.db.commit()

    def add_media(self, media: PortfolioMedia) -> PortfolioMedia:
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def get_media_by_id(self, media_id: UUID) -> Optional[PortfolioMedia]:
        return self.db.query(PortfolioMedia).filter(PortfolioMedia.id == media_id).first()

    def delete_media(self, media: PortfolioMedia):
        self.db.delete(media)
        self.db.commit()
