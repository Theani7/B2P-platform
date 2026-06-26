"""Tests for Sprint 8 Admin Management System."""
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


async def _register_admin(client: AsyncClient) -> tuple[str, str]:
    reg = await client.post("/api/v1/auth/register", json={
        "username": "adminuser",
        "full_name": "Admin User",
        "email": "admin@test.com",
        "password": "StrongPass1!",
        "role": "ADMIN",
    })
    token = reg.json()["access_token"]
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    return token, me.json()["id"]


async def _register_business(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"bizuser{suffix}",
        "full_name": f"Biz User{suffix}",
        "email": f"biz{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "BUSINESS",
    })
    return reg.json()["access_token"]


async def _register_promoter(client: AsyncClient, suffix: str = "") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "username": f"promouser{suffix}",
        "full_name": f"Promo User{suffix}",
        "email": f"promo{suffix}@test.com",
        "password": "StrongPass1!",
        "role": "PROMOTER",
    })
    return reg.json()["access_token"]


# --- Permission Tests ---

@pytest.mark.anyio
async def test_admin_route_requires_admin(client: AsyncClient):
    biz_token = await _register_business(client)
    resp = await client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {biz_token}"})
    assert resp.status_code == 403

    promoter_token = await _register_promoter(client)
    resp = await client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {promoter_token}"})
    assert resp.status_code == 403

    resp = await client.get("/api/v1/admin/dashboard")
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_admin_dashboard(client: AsyncClient):
    token, _ = await _register_admin(client)
    resp = await client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert data["total_users"] >= 1


# --- User Management ---

@pytest.mark.anyio
async def test_admin_list_users(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    await _register_business(client)
    await _register_promoter(client)

    resp = await client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 3


@pytest.mark.anyio
async def test_admin_search_users(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    await _register_business(client)

    resp = await client.get("/api/v1/admin/users?search=bizuser", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.anyio
async def test_admin_filter_users_by_role(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    await _register_business(client)

    resp = await client.get("/api/v1/admin/users?role=BUSINESS", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    for u in resp.json()["items"]:
        assert u["role"] == "BUSINESS"


@pytest.mark.anyio
async def test_admin_suspend_user(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)

    # Get user id
    users_resp = await client.get("/api/v1/admin/users?role=BUSINESS", headers={"Authorization": f"Bearer {admin_token}"})
    user_id = users_resp.json()["items"][0]["id"]

    resp = await client.patch(f"/api/v1/admin/users/{user_id}/suspend", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200

    # Verify user is inactive
    detail = await client.get(f"/api/v1/admin/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert detail.json()["is_active"] is False


@pytest.mark.anyio
async def test_admin_activate_user(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)

    users_resp = await client.get("/api/v1/admin/users?role=BUSINESS", headers={"Authorization": f"Bearer {admin_token}"})
    user_id = users_resp.json()["items"][0]["id"]

    await client.patch(f"/api/v1/admin/users/{user_id}/suspend", headers={"Authorization": f"Bearer {admin_token}"})
    resp = await client.patch(f"/api/v1/admin/users/{user_id}/activate", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200

    detail = await client.get(f"/api/v1/admin/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert detail.json()["is_active"] is True


@pytest.mark.anyio
async def test_admin_delete_user(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)

    users_resp = await client.get("/api/v1/admin/users?role=BUSINESS", headers={"Authorization": f"Bearer {admin_token}"})
    user_id = users_resp.json()["items"][0]["id"]

    resp = await client.delete(f"/api/v1/admin/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200


# --- Verification ---

@pytest.mark.anyio
async def test_promoter_submit_verification_request(client: AsyncClient):
    promoter_token = await _register_promoter(client)
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})

    resp = await client.post(
        "/api/v1/promoter/verification-request",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["success"] is True


@pytest.mark.anyio
async def test_admin_view_verification_requests(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    promoter_token = await _register_promoter(client)
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})
    await client.post("/api/v1/promoter/verification-request", headers={"Authorization": f"Bearer {promoter_token}"})

    resp = await client.get("/api/v1/admin/verification-requests", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.anyio
async def test_admin_approve_verification(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    promoter_token = await _register_promoter(client)
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})
    vr = await client.post("/api/v1/promoter/verification-request", headers={"Authorization": f"Bearer {promoter_token}"})
    vr_id = vr.json()["data"]["id"]

    resp = await client.post(
        f"/api/v1/admin/verification-requests/{vr_id}/approve",
        json={"admin_notes": "Looks good"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

    # Check promoter is verified
    prof = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    assert prof.json()["verified"] is True


@pytest.mark.anyio
async def test_admin_reject_verification(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    promoter_token = await _register_promoter(client)
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})
    vr = await client.post("/api/v1/promoter/verification-request", headers={"Authorization": f"Bearer {promoter_token}"})
    vr_id = vr.json()["data"]["id"]

    resp = await client.post(
        f"/api/v1/admin/verification-requests/{vr_id}/reject",
        json={"admin_notes": "Insufficient credentials"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_admin_revoke_verification(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    promoter_token = await _register_promoter(client)
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser",
        "niche": "TECH",
        "headline": "Test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})
    vr = await client.post("/api/v1/promoter/verification-request", headers={"Authorization": f"Bearer {promoter_token}"})
    vr_id = vr.json()["data"]["id"]
    await client.post(f"/api/v1/admin/verification-requests/{vr_id}/approve", json={}, headers={"Authorization": f"Bearer {admin_token}"})

    prof = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    prof_id = prof.json()["id"]

    resp = await client.post(
        f"/api/v1/admin/promoters/{prof_id}/revoke-verification",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

    prof2 = await client.get("/api/v1/promoter/profile", headers={"Authorization": f"Bearer {promoter_token}"})
    assert prof2.json()["verified"] is False


# --- Campaign Moderation ---

@pytest.mark.anyio
async def test_admin_list_campaigns(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp", "industry": "TECH",
    }, headers={"Authorization": f"Bearer {biz_token}"})
    await client.post("/api/v1/campaigns", json={
        "title": "Test Campaign", "description": "This is a test campaign for testing.",
        "category": "TECH", "budget": 1000, "location": "Remote",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }, headers={"Authorization": f"Bearer {biz_token}"})

    resp = await client.get("/api/v1/admin/campaigns", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.anyio
async def test_admin_archive_campaign(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp", "industry": "TECH",
    }, headers={"Authorization": f"Bearer {biz_token}"})
    c = await client.post("/api/v1/campaigns", json={
        "title": "Test Campaign", "description": "This is a test campaign for testing.",
        "category": "TECH", "budget": 1000, "location": "Remote",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }, headers={"Authorization": f"Bearer {biz_token}"})
    camp_id = c.json()["id"]

    resp = await client.patch(
        f"/api/v1/admin/campaigns/{camp_id}/archive",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


# --- Review Moderation ---

@pytest.mark.anyio
async def test_admin_list_reviews(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    resp = await client.get("/api/v1/admin/reviews", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200


# --- Audit Logs ---

@pytest.mark.anyio
async def test_admin_audit_logs(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    resp = await client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200


# --- Settings ---

@pytest.mark.anyio
async def test_admin_settings(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    await client.get("/api/v1/admin/settings/seed", headers={"Authorization": f"Bearer {admin_token}"})

    resp = await client.get("/api/v1/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) >= 1


@pytest.mark.anyio
async def test_admin_update_setting(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    await client.get("/api/v1/admin/settings/seed", headers={"Authorization": f"Bearer {admin_token}"})

    resp = await client.put(
        "/api/v1/admin/settings/platform_name",
        json={"setting_value": "Byparsathy Platform"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


# --- Analytics ---

@pytest.mark.anyio
async def test_admin_analytics(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    resp = await client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data


# --- Campaign Moderation: Cancel ---

@pytest.mark.anyio
async def test_admin_cancel_campaign(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp", "industry": "TECH",
    }, headers={"Authorization": f"Bearer {biz_token}"})
    c = await client.post("/api/v1/campaigns", json={
        "title": "Cancel Test", "description": "This campaign will be cancelled by admin.",
        "category": "TECH", "budget": 1000, "location": "Remote",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }, headers={"Authorization": f"Bearer {biz_token}"})
    camp_id = c.json()["id"]

    resp = await client.patch(
        f"/api/v1/admin/campaigns/{camp_id}/cancel",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


# --- Review Moderation: Delete ---

@pytest.mark.anyio
async def test_admin_delete_review(client: AsyncClient):
    admin_token, _ = await _register_admin(client)
    biz_token = await _register_business(client)
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp", "industry": "TECH",
    }, headers={"Authorization": f"Bearer {biz_token}"})
    c = await client.post("/api/v1/campaigns", json={
        "title": "Review Campaign", "description": "Campaign for review deletion test.",
        "category": "TECH", "budget": 1000, "location": "Remote",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }, headers={"Authorization": f"Bearer {biz_token}"})
    camp = c.json()
    await client.put(
        f"/api/v1/campaigns/{camp['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    promoter_token = await _register_promoter(client, "delrev")
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser_delrev",
        "niche": "TECH",
        "headline": "Review test",
    }, headers={"Authorization": f"Bearer {promoter_token}"})

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    pp_id = profile_resp.json()["id"]

    invite = await client.post(
        f"/api/v1/campaigns/{camp['id']}/invite/{pp_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    inv_id = invite.json()["data"]["id"]
    accept = await client.post(
        f"/api/v1/invitations/{inv_id}/accept",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    collab_id = accept.json()["data"]["id"]
    await client.post(
        f"/api/v1/collaborations/{collab_id}/complete",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    review = await client.post(
        f"/api/v1/collaborations/{collab_id}/reviews",
        json={"rating": 4, "comment": "Nice work"},
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    review_id = review.json()["id"]

    resp = await client.delete(
        f"/api/v1/admin/reviews/{review_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


# --- Invitation Listings ---

@pytest.mark.anyio
async def test_admin_list_invitations(client: AsyncClient):
    biz_token = await _register_business(client)
    await client.post("/api/v1/business/profile", json={
        "company_name": "Test Corp", "industry": "TECH",
    }, headers={"Authorization": f"Bearer {biz_token}"})
    c = await client.post("/api/v1/campaigns", json={
        "title": "Invite Campaign", "description": "Campaign for invitation list test.",
        "category": "TECH", "budget": 1000, "location": "Remote",
        "start_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }, headers={"Authorization": f"Bearer {biz_token}"})
    camp = c.json()
    await client.put(
        f"/api/v1/campaigns/{camp['id']}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    promoter_token = await _register_promoter(client, "invlist")
    await client.post("/api/v1/promoter/profile", json={
        "username": "promouser_invlist",
        "niche": "TECH",
        "headline": "Invite list",
    }, headers={"Authorization": f"Bearer {promoter_token}"})

    profile_resp = await client.get(
        "/api/v1/promoter/profile",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    pp_id = profile_resp.json()["id"]

    await client.post(
        f"/api/v1/campaigns/{camp['id']}/invite/{pp_id}",
        json={},
        headers={"Authorization": f"Bearer {biz_token}"},
    )

    resp = await client.get(
        "/api/v1/business/invitations",
        headers={"Authorization": f"Bearer {biz_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1

    resp = await client.get(
        "/api/v1/promoter/invitations",
        headers={"Authorization": f"Bearer {promoter_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1
