"""Tests for Sprint 3 campaign management."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base import Base
from app.db.session import engine
from app.middleware.rate_limit import reset_rate_limit_store
from datetime import datetime, timezone, timedelta


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    reset_rate_limit_store()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _campaign_payload(overrides=None):
    data = {
        "title": "Test Campaign",
        "description": "A valid campaign description that meets the minimum length requirement.",
        "category": "TECH",
        "budget": 5000.0,
        "location": "Remote",
        "target_audience": "Young professionals",
        "requirements": "3+ years experience",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "visibility": "PUBLIC",
    }
    if overrides:
        data.update(overrides)
    return data


async def _register_business(client: AsyncClient) -> tuple[str, str]:
    reg = await client.post("/api/v1/auth/register", json={
        "username": "bizuser",
        "full_name": "Biz User",
        "email": "biz@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    uid = me.json()["id"]
    return token, uid


async def _create_business_profile(client: AsyncClient, token: str):
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp",
        "industry": "TECH",
    }, headers={"Authorization": f"Bearer {token}"})


async def _register_promoter(client: AsyncClient) -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": "promouser",
        "full_name": "Promo User",
        "email": "promo@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    return reg.json()["access_token"]


async def _create_campaign(client: AsyncClient, token: str, overrides=None) -> dict:
    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload(overrides),
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json()


@pytest.mark.anyio
async def test_create_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test Campaign"
    assert data["status"] == "DRAFT"
    assert data["visibility"] == "PUBLIC"
    assert data["budget"] == 5000.0


@pytest.mark.anyio
async def test_create_campaign_requires_business_profile(client: AsyncClient):
    token, _ = await _register_business(client)
    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_get_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.get(
        f"/api/v1/campaigns/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Campaign"


@pytest.mark.anyio
async def test_list_campaigns(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    await _create_campaign(client, token, {"title": "Campaign A"})
    await _create_campaign(client, token, {"title": "Campaign B"})

    resp = await client.get(
        "/api/v1/campaigns",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.anyio
async def test_list_campaigns_pagination(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    for i in range(5):
        await _create_campaign(client, token, {"title": f"Campaign {i}"})

    resp = await client.get(
        "/api/v1/campaigns?page=1&limit=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["pages"] == 3


@pytest.mark.anyio
async def test_list_campaigns_search(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    await _create_campaign(client, token, {"title": "Social Media Boost"})
    await _create_campaign(client, token, {"title": "Brand Awareness"})

    resp = await client.get(
        "/api/v1/campaigns?search=Social",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Social Media Boost"


@pytest.mark.anyio
async def test_update_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"title": "Updated Campaign", "budget": 10000.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Updated Campaign"
    assert data["budget"] == 10000.0


@pytest.mark.anyio
async def test_delete_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.delete(
        f"/api/v1/campaigns/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204

    resp = await client.get(
        f"/api/v1/campaigns/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_archive_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.post(
        f"/api/v1/campaigns/{created['id']}/archive",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ARCHIVED"


@pytest.mark.anyio
async def test_reopen_campaign(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)
    await client.post(
        f"/api/v1/campaigns/{created['id']}/archive",
        headers={"Authorization": f"Bearer {token}"},
    )

    resp = await client.post(
        f"/api/v1/campaigns/{created['id']}/reopen",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "DRAFT"


@pytest.mark.anyio
async def test_archive_then_reopen_flow(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    await client.post(
        f"/api/v1/campaigns/{created['id']}/archive",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.post(
        f"/api/v1/campaigns/{created['id']}/reopen",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "DRAFT"


@pytest.mark.anyio
async def test_status_transition_draft_to_open(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "OPEN"


@pytest.mark.anyio
async def test_status_transition_open_to_active(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "ACTIVE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACTIVE"


@pytest.mark.anyio
async def test_status_transition_active_to_completed(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "ACTIVE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "COMPLETED"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETED"


@pytest.mark.anyio
async def test_invalid_status_transition(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "COMPLETED"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_any_to_archived(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.post(
        f"/api/v1/campaigns/{created['id']}/archive",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ARCHIVED"

    resp = await client.post(
        f"/api/v1/campaigns/{created['id']}/archive",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ARCHIVED"


@pytest.mark.anyio
async def test_any_to_cancelled(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    created = await _create_campaign(client, token)

    resp = await client.put(
        f"/api/v1/campaigns/{created['id']}",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "CANCELLED"


@pytest.mark.anyio
async def test_validation_budget_positive(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload({"budget": -100}),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_validation_end_date_after_start(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload({
            "start_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        }),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_validation_description_min_length(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload({"description": "Short"}),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_validation_title_max_length(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload({"title": "A" * 300}),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_permission_promoter_cannot_create(client: AsyncClient):
    token = await _register_promoter(client)

    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_permission_promoter_cannot_list(client: AsyncClient):
    token = await _register_promoter(client)

    resp = await client.get(
        "/api/v1/campaigns",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_campaign_isolation_between_businesses(client: AsyncClient):
    token_a, _ = await _register_business(client)
    await _create_business_profile(client, token_a)
    created = await _create_campaign(client, token_a)
    created_id = created["id"]

    reg_b = await client.post("/api/v1/auth/register", json={
        "username": "bizuser2",
        "full_name": "Biz Two",
        "email": "biz2@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token_b = reg_b.json()["access_token"]
    await _create_business_profile(client, token_b)

    resp = await client.get(
        f"/api/v1/campaigns/{created_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_dashboard_stats(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)

    resp = await client.get(
        "/api/v1/campaigns/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_campaigns"] == 0

    await _create_campaign(client, token)
    resp = await client.get(
        "/api/v1/campaigns/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    data = resp.json()
    assert data["total_campaigns"] == 1
