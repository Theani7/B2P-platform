"""Tests for Sprint 2 profile functionality."""
import pytest
from httpx import AsyncClient
from app.main import app
from app.db.base import Base
from app.db.session import engine


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return AsyncClient(app=app, base_url="http://test")


@pytest.mark.anyio
async def test_business_profile_crud(client: AsyncClient):
    # Register business user
    reg = await client.post("/api/v1/auth/register", json={
        "username": "bizuser",
        "full_name": "Biz User",
        "email": "biz@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create profile
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp",
        "industry": "TECH",
    }, headers=headers)

    # Get profile
    resp = await client.get("/api/v1/business/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["company_name"] == "Test Corp"


@pytest.mark.anyio
async def test_promoter_profile_crud(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "promouser",
        "full_name": "Promo User",
        "email": "promo@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    await client.post("/api/v1/promoter/profile", json={
        "username": "promo_handle",
        "niche": "TECH",
    }, headers=headers)

    resp = await client.get("/api/v1/promoter/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "promo_handle"


@pytest.mark.anyio
async def test_promoter_directory(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "bizdir",
        "full_name": "Biz Dir",
        "email": "bizdir@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/api/v1/promoters", headers=headers)
    assert resp.status_code == 200
    assert "items" in resp.json()