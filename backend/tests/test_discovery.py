"""Tests for Sprint 4 discovery functionality."""
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


def _register(client, username: str, email: str, role: str, password: str = "StrongPass1!"):
    return client.post("/api/v1/auth/register", json={
        "username": username,
        "full_name": f"{role} User",
        "email": email,
        "password": password,
        "role": role,
    })


def _login_headers(client, email: str):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "StrongPass1!"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.anyio
async def test_directory_search_pagination(client: AsyncClient):
    biz = await _register(client, "biz1", "biz1@test.com", "BUSINESS")
    biz_token = biz.json()["access_token"]
    biz_headers = {"Authorization": f"Bearer {biz_token}"}

    prom = await _register(client, "prom1", "prom1@test.com", "PROMOTER")
    prom_token = prom.json()["access_token"]
    prom_headers = {"Authorization": f"Bearer {prom_token}"}

    await client.post("/api/v1/promoter/profile", json={
        "username": "promo_one", "niche": "TECH", "location": "New York",
        "followers_count": 5000, "engagement_rate": 3.5, "years_experience": 2,
    }, headers=prom_headers)

    resp = await client.get("/api/v1/promoters?page=1&limit=10", headers=biz_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1
    assert body["page"] == 1
    assert body["pages"] >= 1
    assert len(body["items"]) >= 1


@pytest.mark.anyio
async def test_directory_search_filter_by_niche(client: AsyncClient):
    biz = await _register(client, "biz2", "biz2@test.com", "BUSINESS")
    biz_headers = {"Authorization": f"Bearer {biz.json()['access_token']}"}

    prom1 = await _register(client, "prom2", "prom2@test.com", "PROMOTER")
    prom2 = await _register(client, "prom3", "prom3@test.com", "PROMOTER")

    await client.post("/api/v1/promoter/profile", json={
        "username": "tech_user", "niche": "TECH",
    }, headers={"Authorization": f"Bearer {prom1.json()['access_token']}"})

    await client.post("/api/v1/promoter/profile", json={
        "username": "food_user", "niche": "FOOD",
    }, headers={"Authorization": f"Bearer {prom2.json()['access_token']}"})

    resp = await client.get("/api/v1/promoters?niche=TECH", headers=biz_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all(i["niche"] == "TECH" for i in items)
    assert any(i["username"] == "tech_user" for i in items)


@pytest.mark.anyio
async def test_directory_search_sort_by_followers(client: AsyncClient):
    biz = await _register(client, "biz3", "biz3@test.com", "BUSINESS")
    biz_headers = {"Authorization": f"Bearer {biz.json()['access_token']}"}

    prom1 = await _register(client, "prom4", "prom4@test.com", "PROMOTER")
    prom2 = await _register(client, "prom5", "prom5@test.com", "PROMOTER")

    await client.post("/api/v1/promoter/profile", json={
        "username": "small_followers", "niche": "TECH", "followers_count": 100,
    }, headers={"Authorization": f"Bearer {prom1.json()['access_token']}"})

    await client.post("/api/v1/promoter/profile", json={
        "username": "big_followers", "niche": "TECH", "followers_count": 10000,
    }, headers={"Authorization": f"Bearer {prom2.json()['access_token']}"})

    resp = await client.get("/api/v1/promoters?sort_by=followers_count&sort_order=desc", headers=biz_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    followers = [i["followers_count"] for i in items if i["username"] in ("small_followers", "big_followers")]
    assert followers == sorted(followers, reverse=True)


@pytest.mark.anyio
async def test_directory_search_text_search(client: AsyncClient):
    biz = await _register(client, "biz4", "biz4@test.com", "BUSINESS")
    biz_headers = {"Authorization": f"Bearer {biz.json()['access_token']}"}

    prom = await _register(client, "prom6", "prom6@test.com", "PROMOTER")
    await client.post("/api/v1/promoter/profile", json={
        "username": "fitness_guru", "niche": "FITNESS", "headline": "Get fit fast",
        "bio": "I love fitness and helping others", "location": "Los Angeles",
    }, headers={"Authorization": f"Bearer {prom.json()['access_token']}"})

    resp = await client.get("/api/v1/promoters?search=fitness", headers=biz_headers)
    assert resp.status_code == 200
    assert any(i["username"] == "fitness_guru" for i in resp.json()["items"])

    resp = await client.get("/api/v1/promoters?search=Los", headers=biz_headers)
    assert resp.status_code == 200
    assert any(i["username"] == "fitness_guru" for i in resp.json()["items"])


@pytest.mark.anyio
async def test_public_profile_view(client: AsyncClient):
    prom = await _register(client, "prom7", "prom7@test.com", "PROMOTER")
    prom_headers = {"Authorization": f"Bearer {prom.json()['access_token']}"}

    await client.post("/api/v1/promoter/profile", json={
        "username": "public_promo", "niche": "TECH", "bio": "Hello world",
    }, headers=prom_headers)

    resp = await client.get("/api/v1/promoters/public_promo")
    assert resp.status_code == 200
    body = resp.json()
    assert body["username"] == "public_promo"
    assert body["bio"] == "Hello world"
    assert "portfolio_items" in body
    assert "social_links" in body


@pytest.mark.anyio
async def test_save_and_remove_promoter(client: AsyncClient):
    biz = await _register(client, "biz5", "biz5@test.com", "BUSINESS")
    biz_headers = {"Authorization": f"Bearer {biz.json()['access_token']}"}

    prom = await _register(client, "prom8", "prom8@test.com", "PROMOTER")
    await client.post("/api/v1/promoter/profile", json={
        "username": "saveable", "niche": "TECH",
    }, headers={"Authorization": f"Bearer {prom.json()['access_token']}"})

    directory = await client.get("/api/v1/promoters", headers=biz_headers)
    promoter_id = directory.json()["items"][0]["id"]

    save = await client.post(f"/api/v1/business/saved-promoters/{promoter_id}", headers=biz_headers)
    assert save.status_code == 201

    saved = await client.get("/api/v1/business/saved-promoters", headers=biz_headers)
    assert saved.status_code == 200
    assert len(saved.json()["items"]) == 1

    remove = await client.delete(f"/api/v1/business/saved-promoters/{promoter_id}", headers=biz_headers)
    assert remove.status_code == 204

    saved2 = await client.get("/api/v1/business/saved-promoters", headers=biz_headers)
    assert len(saved2.json()["items"]) == 0


@pytest.mark.anyio
async def test_duplicate_save_returns_409(client: AsyncClient):
    biz = await _register(client, "biz6", "biz6@test.com", "BUSINESS")
    biz_headers = {"Authorization": f"Bearer {biz.json()['access_token']}"}

    prom = await _register(client, "prom9", "prom9@test.com", "PROMOTER")
    await client.post("/api/v1/promoter/profile", json={
        "username": "dup_promo", "niche": "TECH",
    }, headers={"Authorization": f"Bearer {prom.json()['access_token']}"})

    directory = await client.get("/api/v1/promoters?search=dup_promo", headers=biz_headers)
    pid = directory.json()["items"][0]["id"]

    await client.post(f"/api/v1/business/saved-promoters/{pid}", headers=biz_headers)
    resp = await client.post(f"/api/v1/business/saved-promoters/{pid}", headers=biz_headers)
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_permission_promoter_cannot_access_directory(client: AsyncClient):
    prom = await _register(client, "prom10", "prom10@test.com", "PROMOTER")
    prom_headers = {"Authorization": f"Bearer {prom.json()['access_token']}"}

    resp = await client.get("/api/v1/promoters", headers=prom_headers)
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_permission_promoter_cannot_save(client: AsyncClient):
    prom = await _register(client, "prom11", "prom11@test.com", "PROMOTER")
    prom_headers = {"Authorization": f"Bearer {prom.json()['access_token']}"}

    resp = await client.post("/api/v1/business/saved-promoters/some-id", headers=prom_headers)
    assert resp.status_code == 403
