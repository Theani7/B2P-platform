from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from .schemas import ExportRequest, ExportResponse
from .service import ExportService

router = APIRouter()

@router.post("/", response_model=ExportResponse)
def generate_export(
    request: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExportService(db)
    return service.export_data(request, current_user)
