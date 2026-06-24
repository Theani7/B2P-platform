"""Auth service and integration tests."""
import pytest
from httpx import AsyncClient
from app.main import app
from app.db.session import Base, engine, get_db
from sqlalchemy.orm import Session


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return AsyncClient(app=app, base_url="http://test")


@pytest.mark.anyio
async def test_register_and_login(client: AsyncClient):
    payload = {
        "username": "testuser",
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "StrongPass1!",
        "role": "ADMIN",
    }
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    tokens = resp.json()
    assert "access_token" in tokens and "refresh_token" in tokens

    resp = await client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert resp.status_code == 200
    data = resp.json()
    assert data["access_token"] != tokens["access_token"]


@pytest.mark.anyio
async def test_verify_email(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "vuser",
        "full_name": "Verify",
        "email": "v@example.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    # simulate verification (token stored in DB; in real flow sent by email)
    from app.db.session import SessionLocal
    from app.models.user import User
    db: Session = SessionLocal()
    user = db.query(User).first()
    db.close()
    assert user.verification_token is not None
    resp = await client.post("/api/v1/auth/verify-email", json={"token": user.verification_token})
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_lockout_after_failed_attempts(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "lockuser",
        "full_name": "Lock",
        "email": "lock@example.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    for _ in range(5):
        await client.post("/api/v1/auth/login", json={"email": "lock@example.com", "password": "wrong"})
    resp = await client.post("/api/v1/auth/login", json={"email": "lock@example.com", "password": "StrongPass1!"})
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_role_guard(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "username": "promoter",
        "full_name": "Prom",
        "email": "prom@example.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    resp = await client.post("/api/v1/auth/login", json={"email": "prom@example.com", "password": "StrongPass1!"})
    token = resp.json()["access_token"]
    resp = await client.get("/api/v1/auth/admin/debug", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
