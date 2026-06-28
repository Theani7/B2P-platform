"""Tests for Sprint 7 Review & Rating System."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base import Base
from app.db.session import engine, reinit_engine
from app.middleware.rate_limit import reset_rate_limit_store
from datetime import datetime, timezone, timedelta


@pytest.fixture(autouse=True)
def _setup_db():
    engine = reinit_engine()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    reset_rate_limit_store()
    yield
    engine = reinit_engine()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def _register_business(client: AsyncClient, suffix: str = "") -> tuple[str, str]:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"bizuser{suffix}",
        "full_name": f"Biz User{suffix}",
        "email": f"biz{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    token = reg.json()["access_token"]
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    return token, me.json()["id"]


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


async def _create_open_campaign(client: AsyncClient, token: str) -> dict:
    payload = {
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
    resp = await client.post(
        "/api/v1/campaigns",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    campaign = resp.json()
    await client.put(
        f"/api/v1/campaigns/{campaign['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    return campaign


async def _setup_completed_collaboration(client: AsyncClient) -> dict:
    """Create a completed collaboration and return IDs needed for review tests."""
    biz_token, biz_user_id = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    # Get promoter profile id
    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    promoter_profile_id = profile_resp.json()["id"]

    # Invite promoter
    invite = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{promoter_profile_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite.json()["data"]["id"]

    # Accept invitation
    accept = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    collab_id = accept.json()["data"]["id"]

    # Complete collaboration
    await client.post(
        f"/api/v1/collaborations/{collab_id}/complete",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    return {
        "collab_id": collab_id,
        "biz_token": biz_token,
        "biz_user_id": biz_user_id,
        "promoter_token": promoter_token,
        "campaign_id": campaign["id"],
    }


# --- Complete Collaboration ---

@pytest.mark.anyio
async def test_complete_collaboration(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    pp_id = profile.json()["id"]

    invite = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{pp_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite.json()["data"]["id"]
    accept = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    collab_id = accept.json()["data"]["id"]

    resp = await client.post(
        f"/api/v1/collaborations/{collab_id}/complete",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.anyio
async def test_complete_collaboration_non_participant(client: AsyncClient):
    biz_token, _ = await _register_business(client, "1")
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    pp_id = profile.json()["id"]

    invite = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{pp_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite.json()["data"]["id"]
    accept = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    collab_id = accept.json()["data"]["id"]

    other_token, _ = await _register_business(client, "2")
    await _create_business_profile(client, other_token)

    resp = await client.post(
        f"/api/v1/collaborations/{collab_id}/complete",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 403


# --- Review Creation ---

@pytest.mark.anyio
async def test_business_review_promoter(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 5, "comment": "Excellent promoter!"},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["rating"] == 5
    assert data["comment"] == "Excellent promoter!"
    assert data["reviewer"]["username"] == "bizuser"


@pytest.mark.anyio
async def test_promoter_review_business(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 4, "comment": "Great business partner"},
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp.status_code == 201
    assert resp.json()["rating"] == 4


@pytest.mark.anyio
async def test_prevent_duplicate_review(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 5},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 3},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_prevent_review_uncompleted_collaboration(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    profile = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    pp_id = profile.json()["id"]

    invite = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/invite/{pp_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite.json()["data"]["id"]
    accept = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    collab_id = accept.json()["data"]["id"]

    # Try to review without completing
    resp = await client.post(
        f"/api/v1/collaborations/{collab_id}/reviews",
        json={"rating": 5},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_prevent_review_by_non_participant(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    other_token, _ = await _register_business(client, "other")
    await _create_business_profile(client, other_token)

    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 3},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 403


# --- Review Validation ---

@pytest.mark.anyio
async def test_rating_minimum_1(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)
    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 0},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_rating_maximum_5(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)
    resp = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 6},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 422


# --- Review Update ---

@pytest.mark.anyio
async def test_update_review(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    create = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 3, "comment": "Okay"},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    review_id = create.json()["id"]

    resp = await client.put(
        f"/api/v1/reviews/{review_id}",
        json={"rating": 5, "comment": "Changed my mind, excellent!"},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["rating"] == 5
    assert resp.json()["comment"] == "Changed my mind, excellent!"


@pytest.mark.anyio
async def test_cannot_update_other_review(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    create = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 4},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    review_id = create.json()["id"]

    resp = await client.put(
        f"/api/v1/reviews/{review_id}",
        json={"rating": 1},
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp.status_code == 403


# --- Review Delete ---

@pytest.mark.anyio
async def test_delete_review(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    create = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 2},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    review_id = create.json()["id"]

    resp = await client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 204


@pytest.mark.anyio
async def test_cannot_delete_other_review(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    create = await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 4},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    review_id = create.json()["id"]

    resp = await client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp.status_code == 403


# --- View My Reviews ---

@pytest.mark.anyio
async def test_get_my_reviews(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 5, "comment": "Great!"},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )

    resp = await client.get(
        "/api/v1/my/reviews",
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["rating"] == 5


# --- View User Reviews ---

@pytest.mark.anyio
async def test_get_user_reviews(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    # Business reviews promoter
    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 4},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )

    # Get promoter's user id
    promoter_profile = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )

    resp = await client.get(
        f"/api/v1/users/{ctx['biz_user_id']}/reviews",
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 0  # biz wrote reviews, not received

    # Promoter wrote no review yet, so there should be 1 review for the promoter
    # Actually the business reviewed the promoter, so the promoter reviewee_id should be the promoter's user id
    # Let me get the promoter user id properly
    # The ctx doesn't have promoter_user_id. Let's get it from the profile
    prom_user_id = promoter_profile.json()["user_id"]
    resp2 = await client.get(
        f"/api/v1/users/{prom_user_id}/reviews",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["total"] == 1


# --- Rating Summary ---

@pytest.mark.anyio
async def test_rating_summary(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 5},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )

    # Get promoter user id
    promoter_profile = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    prom_user_id = promoter_profile.json()["user_id"]

    resp = await client.get(
        f"/api/v1/users/{prom_user_id}/rating",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_reviews"] == 1
    assert data["average_rating"] == 5.0
    assert data["distribution"]["star_5"] == 1


@pytest.mark.anyio
async def test_rating_summary_no_reviews(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    resp = await client.get(
        f"/api/v1/users/{ctx['biz_user_id']}/rating",
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_reviews"] == 0
    assert data["average_rating"] == 0.0


@pytest.mark.anyio
async def test_rating_distribution(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    # Need more data for distribution test. Create another collab.
    # For now, just verify the shape
    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 4},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )

    promoter_profile = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    prom_user_id = promoter_profile.json()["user_id"]

    resp = await client.get(
        f"/api/v1/users/{prom_user_id}/rating",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    data = resp.json()
    assert data["distribution"]["star_4"] == 1
    assert data["distribution"]["star_1"] == 0
    assert data["distribution"]["star_2"] == 0
    assert data["distribution"]["star_3"] == 0
    assert data["distribution"]["star_5"] == 0


# --- Permission Tests ---

@pytest.mark.anyio
async def test_create_review_requires_auth(client: AsyncClient):
    resp = await client.post(
        "/api/v1/collaborations/some-id/reviews",
        json={"rating": 5},
    )
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_my_reviews_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/my/reviews")
    assert resp.status_code == 401


# --- View My Received Reviews ---

@pytest.mark.anyio
async def test_get_my_received_reviews(client: AsyncClient):
    ctx = await _setup_completed_collaboration(client)

    # Business reviews promoter
    await client.post(
        f"/api/v1/collaborations/{ctx['collab_id']}/reviews",
        json={"rating": 5, "comment": "Excellent promoter!"},
        headers={"Authorization": f"Bearer {ctx['biz_token']}"},
    )

    # Get promoter user id
    promoter_profile = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    prom_user_id = promoter_profile.json()["user_id"]

    # Promoter gets their received reviews
    resp = await client.get(
        "/api/v1/my/received-reviews",
        headers={"Authorization": f"Bearer {ctx['promoter_token']}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["rating"] == 5
    assert data["items"][0]["business_name"] == "Test Corp"
    assert data["items"][0]["campaign_title"] == "Test Campaign"
