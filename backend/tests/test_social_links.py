"""Tests for Sprint 2 social links CRUD."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base import Base
from app.db.session import engine
from app.middleware.rate_limit import reset_rate_limit_store


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    reset_rate_limit_store()
    yield


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def _register_promoter(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"sluser{suffix}",
        "full_name": f"SL User{suffix}",
        "email": f"sl{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    token = reg.json()["access_token"]
    await client.post("/api/v1/promoter/profile", json={
        "username": f"sluser{suffix}",
        "niche": "TECH",
        "headline": "Social promoter",
    }, headers={"Authorization": f"Bearer {token}"})
    return token


async def _register_business(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"bizsl{suffix}",
        "full_name": f"Biz SL{suffix}",
        "email": f"bizsl{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    return reg.json()["access_token"]


@pytest.mark.anyio
async def test_create_social_link(client: AsyncClient):
    token = await _register_promoter(client)
    resp = await client.post("/api/v1/social-links/", json={
        "platform": "INSTAGRAM",
        "url": "https://instagram.com/test",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    assert resp.json()["platform"] == "INSTAGRAM"
    assert resp.json()["url"] == "https://instagram.com/test"


@pytest.mark.anyio
async def test_list_social_links(client: AsyncClient):
    token = await _register_promoter(client)
    await client.post("/api/v1/social-links/", json={
        "platform": "INSTAGRAM", "url": "https://instagram.com/a",
    }, headers={"Authorization": f"Bearer {token}"})
    await client.post("/api/v1/social-links/", json={
        "platform": "YOUTUBE", "url": "https://youtube.com/@a",
    }, headers={"Authorization": f"Bearer {token}"})
    resp = await client.get("/api/v1/social-links/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 2


@pytest.mark.anyio
async def test_update_social_link(client: AsyncClient):
    token = await _register_promoter(client)
    created = await client.post("/api/v1/social-links/", json={
        "platform": "INSTAGRAM",
        "url": "https://instagram.com/old",
    }, headers={"Authorization": f"Bearer {token}"})
    link_id = created.json()["id"]
    resp = await client.put(f"/api/v1/social-links/{link_id}", json={
        "url": "https://instagram.com/new",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["url"] == "https://instagram.com/new"


@pytest.mark.anyio
async def test_delete_social_link(client: AsyncClient):
    token = await _register_promoter(client)
    created = await client.post("/api/v1/social-links/", json={
        "platform": "TIKTOK",
        "url": "https://tiktok.com/@test",
    }, headers={"Authorization": f"Bearer {token}"})
    link_id = created.json()["id"]
    resp = await client.delete(f"/api/v1/social-links/{link_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204
    resp = await client.get("/api/v1/social-links/", headers={"Authorization": f"Bearer {token}"})
    assert len(resp.json()) == 0


@pytest.mark.anyio
async def test_business_cannot_create_social_link(client: AsyncClient):
    token = await _register_business(client)
    resp = await client.post("/api/v1/social-links/", json={
        "platform": "LINKEDIN",
        "url": "https://linkedin.com/in/test",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
