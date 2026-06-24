"""Portfolio routes for promoters."""
import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ...dependencies.auth import get_current_user, require_role
from ...core.role import Role
from ...schemas.portfolio_item import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemRead
from ...services.portfolio import create_item, get_my_items, update_item, delete_item
from ...db.session import get_db

router = APIRouter(prefix="/portfolio", tags=["portfolio"], dependencies=[Depends(require_role(Role.PROMOTER))])


@router.post("/", response_model=PortfolioItemRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(payload: PortfolioItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_item(db, user, payload)


@router.get("/", response_model=List[PortfolioItemRead])
def list_portfolio(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_my_items(db, user)


@router.put("/{item_id}", response_model=PortfolioItemRead)
def update_portfolio(item_id: uuid.UUID, payload: PortfolioItemUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_item(db, user, item_id, payload)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(item_id: uuid.UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    delete_item(db, user, item_id)
    return None