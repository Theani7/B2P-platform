"""Tests for Sprint 2 portfolio items CRUD."""
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
        "username": f"pouser{suffix}",
        "full_name": f"Promo User{suffix}",
        "email": f"po{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    token = reg.json()["access_token"]
    await client.post("/api/v1/promoter/profile", json={
        "username": f"pouser{suffix}",
        "niche": "TECH",
        "headline": "Top promoter",
    }, headers={"Authorization": f"Bearer {token}"})
    return token


async def _register_business(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"bizpo{suffix}",
        "full_name": f"Biz PO{suffix}",
        "email": f"bizpo{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    return reg.json()["access_token"]


@ pytest.mark.anyio
async def test_create_portfolio_item(client: AsyncClient):
    token = await _register_promoter(client)
    resp = await client.post("/api/v1/portfolio/", json={
        "title": "My Campaign",
        "description": "A successful campaign I ran",
        "external_link": "https://example.com/portfolio",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201


@ pytest.mark.anyio
async def test_list_portfolio_items(client: AsyncClient):
    token = await _register_promoter(client)
    await client.post("/api/v1/portfolio/", json={
        "title": "Item One",
        "description": "My first portfolio item description",
    }, headers={"Authorization": f"Bearer {token}"})
    await client.post("/api/v1/portfolio/", json={
        "title": "Item Two",
        "description": "My second portfolio item description",
    }, headers={"Authorization": f"Bearer {token}"})
    resp = await client.get("/api/v1/portfolio/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 2
    assert items[0]["title"] == "Item One"
    assert items[1]["title"] == "Item Two"


@ pytest.mark.anyio
async def test_update_portfolio_item(client: AsyncClient):
    token = await _register_promoter(client)
    created = await client.post("/api/v1/portfolio/", json={
        "title": "Original Title",
        "description": "Description for my portfolio item",
    }, headers={"Authorization": f"Bearer {token}"})
    item_id = created.json()["id"]
    resp = await client.put(f"/api/v1/portfolio/{item_id}", json={
        "title": "Updated Title",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


@ pytest.mark.anyio
async def test_delete_portfolio_item(client: AsyncClient):
    token = await _register_promoter(client)
    created = await client.post("/api/v1/portfolio/", json={
        "title": "Delete Me",
        "description": "This item will be deleted",
    }, headers={"Authorization": f"Bearer {token}"})
    item_id = created.json()["id"]
    resp = await client.delete(f"/api/v1/portfolio/{item_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204
    resp = await client.get("/api/v1/portfolio/", headers={"Authorization": f"Bearer {token}"})
    assert len(resp.json()) == 0


@ pytest.mark.anyio
async def test_business_cannot_create_portfolio(client: AsyncClient):
    token = await _register_business(client)
    resp = await client.post("/api/v1/portfolio/", json={
        "title": "Not Allowed",
        "description": "Business should not create portfolio items",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


@ pytest.mark.anyio
async def test_unauthenticated_cannot_create_portfolio(client: AsyncClient):
    resp = await client.post("/api/v1/portfolio/", json={
        "title": "No Auth",
        "description": "No token should be rejected",
    })
    assert resp.status_code == 401
