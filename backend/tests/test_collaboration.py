"""Tests for Sprint 5 collaboration workflow."""
import pytest
from httpx import AsyncClient
from app.main import app
from app.db.base import Base
from app.db.session import engine
from datetime import datetime, timezone, timedelta


@pytest.fixture(autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return AsyncClient(app=app, base_url="http://test")


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
    return reg.json()["access_token"], reg.json()["user"]["id"]


async def _register_promoter(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"promouser{suffix}",
        "full_name": f"Promo User{suffix}",
        "email": f"promo{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    return reg.json()["access_token"]


async def _create_business_profile(client: AsyncClient, token: str):
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp",
        "industry": "TECH",
    }, headers={"Authorization": f"Bearer {token}"})


async def _create_promoter_profile(client: AsyncClient, token: str):
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Top promoter",
    }, headers={"Authorization": f"Bearer {token}"})


async def _create_open_campaign(client: AsyncClient, token: str, overrides=None) -> dict:
    resp = await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload(overrides),
        headers={"Authorization": f"Bearer {token}"},
    )
    campaign = resp.json()
    await client.put(
        f"/api/v1/campaigns/{campaign['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    return campaign


# --- Marketplace ---

@pytest.mark.anyio
async def test_marketplace_returns_public_campaigns(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    await _create_open_campaign(client, token)

    promoter_token = await _register_promoter(client)
    resp = await client.get(
        "/api/v1/campaign-marketplace",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Test Campaign"
    assert data["items"][0]["business_name"] == "Test Corp"


@pytest.mark.anyio
async def test_marketplace_excludes_non_open_campaigns(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    await _create_open_campaign(client, token)

    await client.post(
        "/api/v1/campaigns",
        json=_campaign_payload({"title": "Draft Campaign"}),
        headers={"Authorization": f"Bearer {token}"},
    )

    promoter_token = await _register_promoter(client)
    resp = await client.get(
        "/api/v1/campaign-marketplace",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


@pytest.mark.anyio
async def test_marketplace_search(client: AsyncClient):
    token, _ = await _register_business(client)
    await _create_business_profile(client, token)
    await _create_open_campaign(client, token, {"title": "Social Media Campaign"})
    await _create_open_campaign(client, token, {"title": "Brand Awareness"})

    promoter_token = await _register_promoter(client)
    resp = await client.get(
        "/api/v1/campaign-marketplace?search=Social",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


# --- Applications ---

@pytest.mark.anyio
async def test_promoter_apply_to_campaign(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={"message": "I'd love to work on this!"},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["data"]["status"] == "PENDING"


@pytest.mark.anyio
async def test_prevent_duplicate_application(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_promoter_withdraw_application(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    apply_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    app_id = apply_resp.json()["data"]["id"]

    resp = await client.delete(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 204


@pytest.mark.anyio
async def test_promoter_view_applications(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )

    resp = await client.get(
        "/api/v1/promoter/applications",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


# --- Application Review ---

@pytest.mark.anyio
async def test_business_view_campaign_applications(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/applications",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


@pytest.mark.anyio
async def test_accept_application_creates_collaboration(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    app_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    app_id = app_resp.json()["data"]["id"]

    accept_resp = await client.post(
        f"/api/v1/applications/{app_id}/accept",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert accept_resp.status_code == 201
    assert accept_resp.json()["data"]["status"] == "ACTIVE"

    # Verify collaboration exists
    collab_resp = await client.get(
        "/api/v1/business/collaborations",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert collab_resp.json()["total"] == 1


@pytest.mark.anyio
async def test_reject_application(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    app_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    app_id = app_resp.json()["data"]["id"]

    reject_resp = await client.post(
        f"/api/v1/applications/{app_id}/reject",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert reject_resp.status_code == 200


# --- Invitations ---

@pytest.mark.anyio
async def test_business_invite_promoter(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    # Get promoter profile id
    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    invite_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={"message": "We'd love to work with you!"},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert invite_resp.status_code == 201
    assert invite_resp.json()["data"]["status"] == "PENDING"


@pytest.mark.anyio
async def test_prevent_duplicate_invitation(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_business_cancel_invitation(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    invite_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite_resp.json()["data"]["id"]

    cancel_resp = await client.delete(
        f"/api/v1/invitations/{inv_id}",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert cancel_resp.status_code == 204


# --- Invitation Response ---

@pytest.mark.anyio
async def test_promoter_accept_invitation_creates_collaboration(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    invite_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite_resp.json()["data"]["id"]

    accept_resp = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert accept_resp.status_code == 201

    collab_resp = await client.get(
        "/api/v1/promoter/collaborations",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert collab_resp.json()["total"] == 1


@pytest.mark.anyio
async def test_promoter_reject_invitation(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    invite_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite_resp.json()["data"]["id"]

    reject_resp = await client.post(
        f"/api/v1/invitations/{inv_id}/reject",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert reject_resp.status_code == 200


# --- Permissions ---

@pytest.mark.anyio
async def test_promoter_cannot_invite(client: AsyncClient):
    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    resp = await client.post(
        "/api/v1/campaigns/some-id/invite/some-promoter",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_promoter_cannot_accept_application(client: AsyncClient):
    promoter_token = await _register_promoter(client)

    resp = await client.post(
        "/api/v1/applications/some-id/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_business_cannot_apply(client: AsyncClient):
    biz_token, _ = await _register_business(client)

    resp = await client.post(
        "/api/v1/campaigns/some-id/apply",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_business_cannot_accept_invitation(client: AsyncClient):
    biz_token, _ = await _register_business(client)

    resp = await client.post(
        "/api/v1/invitations/some-id/accept",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 403


# --- Collaborations ---

@pytest.mark.anyio
async def test_business_view_collaborations(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    app_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/apply",
        json={},
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    app_id = app_resp.json()["data"]["id"]

    await client.post(
        f"/api/v1/applications/{app_id}/accept",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        "/api/v1/business/collaborations",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["campaign_title"] == "Test Campaign"


@pytest.mark.anyio
async def test_promoter_view_collaborations(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_id = profile_resp.json()["id"]

    invite_resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite_resp.json()["data"]["id"]

    await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )

    resp = await client.get(
        "/api/v1/promoter/collaborations",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
