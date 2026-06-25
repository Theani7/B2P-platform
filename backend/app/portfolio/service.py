from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
from .repository import PortfolioRepository
from .schemas import PortfolioItemCreate, PortfolioItemUpdate
from ..models.portfolio_item import PortfolioItem

class PortfolioService:
    def __init__(self, db: Session):
        self.repo = PortfolioRepository(db)

    def create_item(self, promoter_id: UUID, item_in: PortfolioItemCreate) -> PortfolioItem:
        if item_in.featured:
            if self.repo.count_featured(promoter_id) >= 3:
                raise HTTPException(status_code=400, detail="Maximum of 3 featured items allowed.")
                
        db_item = PortfolioItem(**item_in.model_dump(), promoter_profile_id=promoter_id)
        return self.repo.create(db_item)

    def get_promoter_items(self, promoter_id: UUID, skip: int = 0, limit: int = 100):
        return self.repo.get_by_promoter(promoter_id, skip, limit)

    def get_item(self, item_id: UUID):
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        return item

    def update_item(self, item_id: UUID, promoter_id: UUID, item_in: PortfolioItemUpdate) -> PortfolioItem:
        item = self.get_item(item_id)
        if item.promoter_profile_id != promoter_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this item")

        if item_in.featured is True and not item.featured:
            if self.repo.count_featured(promoter_id) >= 3:
                raise HTTPException(status_code=400, detail="Maximum of 3 featured items allowed.")

        update_data = item_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
            
        return self.repo.update(item)

    def delete_item(self, item_id: UUID, promoter_id: UUID):
        item = self.get_item(item_id)
        if item.promoter_profile_id != promoter_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this item")
        self.repo.delete(item)
