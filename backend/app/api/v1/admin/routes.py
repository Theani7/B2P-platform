"""Admin routes - ADMIN role required for all endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from ....dependencies.auth import get_current_user, require_role
from ....core.role import Role
from ....db.session import get_db
from ....schemas.admin import (
    DashboardStats,
    AnalyticsData,
    AdminUserListResponse,
    AdminCampaignListResponse,
    AdminReviewListResponse,
    VerificationRequestListResponse,
    VerificationAction,
    AuditLogListResponse,
    PlatformSettingListResponse,
    PlatformSettingUpdate,
)
from ....services.admin import (
    get_dashboard_stats,
    get_analytics,
    get_admin_users,
    get_admin_user_detail,
    suspend_user,
    activate_user,
    soft_delete_user,
    get_verification_requests,
    approve_verification,
    reject_verification,
    revoke_verification,
    get_admin_campaigns,
    archive_campaign_admin,
    cancel_campaign_admin,
    get_admin_reviews,
    delete_review_admin,
    get_audit_logs,
    get_all_settings,
    update_setting,
    seed_default_settings,
    delete_setting,
    log_action,
)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role(Role.ADMIN))])


@router.get("/dashboard", response_model=DashboardStats)
def admin_dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_dashboard_stats(db)


@router.get("/users", response_model=AdminUserListResponse)
def admin_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_admin_users(db, page=page, limit=limit, search=search, role=role, is_active=is_active)
    return AdminUserListResponse(items=items, total=total, page=page, limit=limit, pages=max(1, (total + limit - 1) // limit))


@router.get("/users/{user_id}")
def admin_user_detail(user_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_admin_user_detail(db, user_id)


@router.patch("/users/{user_id}/suspend")
def admin_suspend_user(user_id: str, request: Request, db: Session = Depends(get_db), admin_user=Depends(get_current_user)):
    suspend_user(db, user_id, str(admin_user.id), request)
    return {"success": True, "message": "User suspended"}


@router.patch("/users/{user_id}/activate")
def admin_activate_user(user_id: str, request: Request, db: Session = Depends(get_db), admin_user=Depends(get_current_user)):
    activate_user(db, user_id, str(admin_user.id), request)
    return {"success": True, "message": "User activated"}


@router.delete("/users/{user_id}")
def admin_delete_user(user_id: str, request: Request, db: Session = Depends(get_db), admin_user=Depends(get_current_user)):
    soft_delete_user(db, user_id, str(admin_user.id), request)
    return {"success": True, "message": "User deleted"}


@router.get("/verification-requests", response_model=VerificationRequestListResponse)
def admin_verification_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_verification_requests(db, page=page, limit=limit, status_filter=status)
    return VerificationRequestListResponse(items=items, total=total, page=page, limit=limit, pages=max(1, (total + limit - 1) // limit))


@router.post("/verification-requests/{request_id}/approve")
def admin_approve_verification(
    request_id: str,
    body: VerificationAction,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    approve_verification(db, request_id, admin_user, body.admin_notes, request)
    return {"success": True, "message": "Verification approved"}


@router.post("/verification-requests/{request_id}/reject")
def admin_reject_verification(
    request_id: str,
    body: VerificationAction,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    reject_verification(db, request_id, admin_user, body.admin_notes, request)
    return {"success": True, "message": "Verification rejected"}


@router.post("/promoters/{promoter_profile_id}/revoke-verification")
def admin_revoke_verification(
    promoter_profile_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    revoke_verification(db, promoter_profile_id, admin_user, request)
    return {"success": True, "message": "Verification revoked"}


@router.get("/campaigns", response_model=AdminCampaignListResponse)
def admin_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_admin_campaigns(db, page=page, limit=limit, search=search, status_filter=status)
    return AdminCampaignListResponse(items=items, total=total, page=page, limit=limit, pages=max(1, (total + limit - 1) // limit))


@router.patch("/campaigns/{campaign_id}/archive")
def admin_archive_campaign(
    campaign_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    archive_campaign_admin(db, campaign_id, admin_user, request)
    return {"success": True, "message": "Campaign archived"}


@router.patch("/campaigns/{campaign_id}/cancel")
def admin_cancel_campaign(
    campaign_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    cancel_campaign_admin(db, campaign_id, admin_user, request)
    return {"success": True, "message": "Campaign cancelled"}


@router.get("/reviews", response_model=AdminReviewListResponse)
def admin_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_admin_reviews(db, page=page, limit=limit, search=search)
    return AdminReviewListResponse(items=items, total=total, page=page, limit=limit, pages=max(1, (total + limit - 1) // limit))


@router.delete("/reviews/{review_id}")
def admin_delete_review(
    review_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_user),
):
    delete_review_admin(db, review_id, admin_user, request)
    return {"success": True, "message": "Review deleted"}


@router.get("/audit-logs", response_model=AuditLogListResponse)
def admin_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, total = get_audit_logs(db, page=page, limit=limit, search=search, action=action, user_id=user_id, date_from=date_from, date_to=date_to)
    return AuditLogListResponse(items=items, total=total, page=page, limit=limit, pages=max(1, (total + limit - 1) // limit))


@router.get("/settings", response_model=PlatformSettingListResponse)
def admin_settings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = get_all_settings(db)
    return PlatformSettingListResponse(items=items)


@router.post("/settings/seed")
def admin_seed_settings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    seed_default_settings(db)
    return {"success": True, "message": "Default settings seeded"}


@router.put("/settings/{setting_key}")
def admin_update_setting(
    setting_key: str,
    body: PlatformSettingUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    update_setting(db, setting_key, body.setting_value, body.description)
    return {"success": True, "message": "Setting updated"}


@router.delete("/settings/{setting_key}")
def admin_delete_setting(
    setting_key: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    delete_setting(db, setting_key)
    return {"success": True, "message": "Setting deleted"}


@router.get("/analytics", response_model=AnalyticsData)
def admin_analytics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_analytics(db)
