"""Tests for Sprint 6 Smart Matching System."""
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


async def _create_promoter_profile(
    client: AsyncClient, token: str, overrides: dict = None
):
    data = {
        "username": "promouser",
        "niche": "TECH",
        "headline": "Top promoter",
        "location": "Remote",
        "followers_count": 50000,
        "engagement_rate": 8.0,
        "years_experience": 3,
    }
    if overrides:
        data.update(overrides)
    await client.post("/api/v1/promoter/profile", json=data, headers={"Authorization": f"Bearer {token}"})


async def _create_open_campaign(client: AsyncClient, token: str, overrides=None) -> dict:
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
    if overrides:
        payload.update(overrides)
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


# --- Score Calculation Tests ---

@pytest.mark.anyio
async def test_generate_matches_returns_results(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    promoter_token = await _register_promoter(client)
    await _create_promoter_profile(client, promoter_token)

    resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["total_matches"] >= 1


@pytest.mark.anyio
async def test_matches_ranked_by_score(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    # Promoter 1: perfect match
    p1_token = await _register_promoter(client, "1")
    await _create_promoter_profile(client, p1_token, {
        "username": "promouser1",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 200000,
        "engagement_rate": 15.0,
        "years_experience": 8,
    })

    # Promoter 2: poor match
    p2_token = await _register_promoter(client, "2")
    await _create_promoter_profile(client, p2_token, {
        "username": "promouser2",
        "niche": "FOOD",
        "location": "New York",
        "followers_count": 500,
        "engagement_rate": 0.5,
        "years_experience": 0,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 2
    # Sorted descending by score
    assert items[0]["score"] >= items[1]["score"]


@pytest.mark.anyio
async def test_matches_limited_to_top_10(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    for i in range(12):
        t = await _register_promoter(client, str(i))
        await _create_promoter_profile(client, t, {
            "username": f"promouser{i}",
            "niche": "TECH" if i < 6 else "FOOD",
            "location": "Remote",
        })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches?limit=10",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 10


# --- Classification Tests ---

@pytest.mark.anyio
async def test_excellent_match_classification(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p_token = await _register_promoter(client, "ex")
    await _create_promoter_profile(client, p_token, {
        "username": "promouser_ex",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 200000,
        "engagement_rate": 12.0,
        "years_experience": 6,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    item = resp.json()["items"][0]
    assert item["classification"] == "EXCELLENT_MATCH"
    assert item["score"] >= 90


@pytest.mark.anyio
async def test_low_match_classification(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p_token = await _register_promoter(client, "low")
    await _create_promoter_profile(client, p_token, {
        "username": "promouser_low",
        "niche": "FOOD",
        "location": "New York",
        "followers_count": 100,
        "engagement_rate": 0.1,
        "years_experience": 0,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    item = resp.json()["items"][0]
    assert item["classification"] == "LOW_MATCH"
    assert item["score"] < 50


# --- Score Breakdown Tests ---

@pytest.mark.anyio
async def test_score_breakdown_contains_all_components(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p_token = await _register_promoter(client, "brk")
    await _create_promoter_profile(client, p_token, {
        "username": "promouser_brk",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 100000,
        "engagement_rate": 10.0,
        "years_experience": 5,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    breakdown = resp.json()["items"][0]["score_breakdown"]
    for key in ("niche", "location", "followers", "experience", "engagement"):
        assert key in breakdown


# --- Explanation Tests ---

@pytest.mark.anyio
async def test_match_explanation_is_generated(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p_token = await _register_promoter(client, "exp")
    await _create_promoter_profile(client, p_token, {
        "username": "promouser_exp",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 100000,
        "engagement_rate": 8.0,
        "years_experience": 4,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    explanation = resp.json()["items"][0]["explanation"]
    assert isinstance(explanation, str)
    assert len(explanation) > 0
    assert "Recommended because" in explanation


# --- Filtering Tests ---

@pytest.mark.anyio
async def test_filter_matches_by_classification(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p1_token = await _register_promoter(client, "f1")
    await _create_promoter_profile(client, p1_token, {
        "username": "promouser_f1",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 200000,
        "engagement_rate": 12.0,
        "years_experience": 6,
    })

    p2_token = await _register_promoter(client, "f2")
    await _create_promoter_profile(client, p2_token, {
        "username": "promouser_f2",
        "niche": "FOOD",
        "location": "New York",
        "followers_count": 100,
        "engagement_rate": 0.1,
        "years_experience": 0,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches?classification=EXCELLENT_MATCH",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 1
    assert resp.json()["items"][0]["classification"] == "EXCELLENT_MATCH"


@pytest.mark.anyio
async def test_filter_matches_by_min_score(client: AsyncClient):
    biz_token, _ = await _register_business(client)
    await _create_business_profile(client, biz_token)
    campaign = await _create_open_campaign(client, biz_token)

    p1_token = await _register_promoter(client, "ms1")
    await _create_promoter_profile(client, p1_token, {
        "username": "promouser_ms1",
        "niche": "TECH",
        "location": "Remote",
        "followers_count": 200000,
        "engagement_rate": 12.0,
        "years_experience": 6,
    })

    p2_token = await _register_promoter(client, "ms2")
    await _create_promoter_profile(client, p2_token, {
        "username": "promouser_ms2",
        "niche": "FOOD",
        "location": "New York",
        "followers_count": 100,
        "engagement_rate": 0.1,
        "years_experience": 0,
    })

    await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        f"/api/v1/campaigns/{campaign['id']}/matches?min_score=50",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    for item in resp.json()["items"]:
        assert item["score"] >= 50


# --- Permission Tests ---

@pytest.mark.anyio
async def test_generate_matches_requires_business(client: AsyncClient):
    promoter_token = await _register_promoter(client)
    resp = await client.post(
        "/api/v1/campaigns/some-id/generate-matches",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_view_matches_requires_business(client: AsyncClient):
    promoter_token = await _register_promoter(client)
    resp = await client.get(
        "/api/v1/campaigns/some-id/matches",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_generate_matches_requires_auth(client: AsyncClient):
    resp = await client.post("/api/v1/campaigns/some-id/generate-matches")
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_business_cannot_generate_matches_for_other_campaign(client: AsyncClient):
    biz1_token, _ = await _register_business(client, "1")
    await _create_business_profile(client, biz1_token)
    campaign = await _create_open_campaign(client, biz1_token)

    biz2_token, _ = await _register_business(client, "2")
    await _create_business_profile(client, biz2_token)

    resp = await client.post(
        f"/api/v1/campaigns/{campaign['id']}/generate-matches",
        headers={"Authorization": f"Bearer {biz2_token}"},
    )
    assert resp.status_code == 403
