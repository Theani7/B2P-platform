"""Tests for password reset flow."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.middleware.rate_limit import reset_rate_limit_store
from app.models.user import User
from sqlalchemy.orm import Session


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    reset_rate_limit_store()
    yield


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.mark.anyio
async def test_forgot_password(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "fpuser",
        "full_name": "FP User",
        "email": "fp@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "fp@test.com"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.anyio
async def test_reset_password(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "rpuser",
        "full_name": "RP User",
        "email": "rp@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    await client.post("/api/v1/auth/forgot-password", json={"email": "rp@test.com"})
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == "rp@test.com").first()
    reset_token = user.verification_token
    db.close()
    assert reset_token is not None
    resp = await client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "NewStrongPass1!",
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.anyio
async def test_reset_password_invalid_token(client: AsyncClient):
    resp = await client.post("/api/v1/auth/reset-password", json={
        "token": "bogus-token-that-does-not-exist",
        "new_password": "NewStrongPass1!",
    })
    assert resp.status_code == 404
