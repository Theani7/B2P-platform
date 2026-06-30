"""Business verification request routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....db.session import get_db
from ....services.admin import submit_verification_request

router = APIRouter(prefix="/business/verification-request", tags=["business-verification"], dependencies=[Depends(require_role(Role.BUSINESS))])


@router.post("", status_code=201)
def create_verification_request(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    vr = submit_verification_request(db, user)
    return {"success": True, "data": {"id": str(vr.id), "status": vr.status.value if hasattr(vr.status, "value") else str(vr.status)}}
