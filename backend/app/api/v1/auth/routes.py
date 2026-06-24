"""Authentication routes with role-protected examples."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ....core.role import Role
from ....dependencies.auth import get_current_user, require_role
from ....db.session import get_db
from ....schemas.user import (
    ForgotPasswordSchema,
    LoginSchema,
    RefreshSchema,
    ResetPasswordSchema,
    TokenSchema,
    UserCreate,
    UserRead,
    UserUpdate,
    VerifyEmailSchema,
)
from ....services.auth import (
    forgot_password,
    login,
    refresh,
    register,
    reset_password,
    verify_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
def register_endpoint(payload: UserCreate, db: Session = Depends(get_db)):
    return register(db, payload)


@router.post("/login", response_model=TokenSchema)
def login_endpoint(payload: LoginSchema, db: Session = Depends(get_db)):
    return login(db, payload)


@router.post("/logout")
def logout_endpoint(current_user=Depends(get_current_user)):
    return {"success": True, "message": "Logged out"}


@router.post("/refresh", response_model=TokenSchema)
def refresh_endpoint(payload: RefreshSchema, db: Session = Depends(get_db)):
    return refresh(db, payload.refresh_token)


@router.post("/verify-email")
def verify_email_endpoint(payload: VerifyEmailSchema, db: Session = Depends(get_db)):
    verify_email(db, payload)
    return {"success": True, "message": "Email verified"}


@router.post("/forgot-password")
def forgot_password_endpoint(payload: ForgotPasswordSchema, db: Session = Depends(get_db)):
    forgot_password(db, payload)
    return {"success": True, "message": "If an account exists, a reset email was sent"}


@router.post("/reset-password")
def reset_password_endpoint(payload: ResetPasswordSchema, db: Session = Depends(get_db)):
    reset_password(db, payload)
    return {"success": True, "message": "Password reset successful"}


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.email is not None:
        current_user.email = payload.email
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/admin/debug", dependencies=[Depends(require_role(Role.ADMIN))])
def admin_debug():
    return {"success": True, "data": {"admin": True}}


@router.get("/business/reports", dependencies=[Depends(require_role(Role.BUSINESS))])
def business_reports():
    return {"success": True, "data": {"reports": []}}


@router.get("/promoter/campaigns", dependencies=[Depends(require_role(Role.PROMOTER))])
def promoter_campaigns():
    return {"success": True, "data": {"campaigns": []}}
