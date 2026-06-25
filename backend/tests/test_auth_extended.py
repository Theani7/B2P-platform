"""Extended auth tests for refresh, logout, profile, and duplicate checks."""
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


@pytest.mark.anyio
async def test_token_refresh(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "refuser",
        "full_name": "Refresh User",
        "email": "refresh@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    assert reg.status_code == 201
    refresh_token = reg.json()["refresh_token"]
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.anyio
async def test_token_refresh_with_invalid_token(client: AsyncClient):
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": "totally-fake-token"})
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_logout(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "logoutuser",
        "full_name": "Logout User",
        "email": "logout@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    resp = await client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.anyio
async def test_me_authenticated(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "meuser",
        "full_name": "Me User",
        "email": "me@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    token = reg.json()["access_token"]
    resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@test.com"
    assert data["username"] == "meuser"
    assert data["full_name"] == "Me User"
    assert data["role"] == "PROMOTER"


@pytest.mark.anyio
async def test_update_profile(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "username": "upuser",
        "full_name": "Original Name",
        "email": "up@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    resp = await client.patch("/api/v1/auth/me", json={
        "full_name": "Updated Name",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"


@pytest.mark.anyio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "firstuser",
        "full_name": "First User",
        "email": "dup@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    resp = await client.post("/api/v1/auth/register", json={
        "username": "seconduser",
        "full_name": "Second User",
        "email": "dup@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_register_duplicate_username(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "sharedname",
        "full_name": "First User",
        "email": "first@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    resp = await client.post("/api/v1/auth/register", json={
        "username": "sharedname",
        "full_name": "Second User",
        "email": "second@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    assert resp.status_code == 409
