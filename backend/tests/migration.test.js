import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:8000";

describe("Post-Migration API Comprehensive Verification", () => {
  let testUser = {
    username: `ts_mig_${Date.now()}`,
    fullName: "TS Migration Tester",
    email: `ts_mig_${Date.now()}@example.com`,
    password: "Password123!",
    role: "PROMOTER",
  };

  let createdUser;
  let accessToken = "";
  let refreshToken = "";

  before(async () => {
    // Create an active, verified promoter user directly for authenticating test requests
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    createdUser = await prisma.user.create({
      data: {
        username: testUser.username,
        fullName: testUser.fullName,
        email: testUser.email,
        passwordHash,
        role: "PROMOTER",
        isActive: true,
        isVerified: true,
        promoterProfile: {
          create: {
            username: testUser.username,
            bio: "Migration test bio",
            niche: "TECH",
            location: "Kathmandu",
          },
        },
      },
    });
  });

  after(async () => {
    if (createdUser?.id) {
      await prisma.promoterProfile.deleteMany({ where: { userId: createdUser.id } });
      await prisma.revokedRefreshToken.deleteMany();
      await prisma.user.deleteMany({ where: { id: createdUser.id } });
    }
  });

  test("1. System health & ready endpoints respond correctly", async () => {
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, "healthy");
    assert.equal(healthData.database, "healthy");

    const readyRes = await fetch(`${BASE_URL}/ready`);
    assert.equal(readyRes.status, 200);

    const versionRes = await fetch(`${BASE_URL}/version`);
    assert.equal(versionRes.status, 200);
    const versionData = await versionRes.json();
    assert.equal(versionData.name, "Byparsathy");
  });

  test("2. Public platform settings endpoint returns seeded settings", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/settings`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 4);
  });

  test("3. Availability check endpoint works", async () => {
    // Existing user should return false
    const res = await fetch(`${BASE_URL}/api/v1/auth/check?email=${encodeURIComponent(testUser.email)}&username=${testUser.username}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.usernameAvailable, false);
    assert.equal(json.data.emailAvailable, false);

    // Random non-existent user should return true
    const res2 = await fetch(`${BASE_URL}/api/v1/auth/check?email=free_${Date.now()}@avail.com&username=free_${Date.now()}`);
    const json2 = await res2.json();
    assert.equal(json2.data.usernameAvailable, true);
    assert.equal(json2.data.emailAvailable, true);
  });

  test("4. User login returns JWT access and refresh tokens", async () => {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const loginJson = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.equal(loginJson.success, true);
    assert.ok(loginJson.data.access_token);
    assert.ok(loginJson.data.refresh_token);
    accessToken = loginJson.data.access_token;
    refreshToken = loginJson.data.refresh_token;
  });

  test("5. Protected route /auth/me returns current authenticated user and profile", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.email, testUser.email);
    assert.equal(json.data.role, "PROMOTER");
    assert.ok(json.data.promoterProfile);
  });

  test("6. Protected route rejects unauthenticated request with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`);
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  test("7. Protected route rejects invalid token with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: "Bearer bogus-token-12345" },
    });
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  test("8. Admin route rejects non-admin user with 403", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  test("9. Refresh token endpoint issues new token pair", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.access_token);
    assert.ok(json.data.refresh_token);
    assert.notEqual(json.data.refresh_token, refreshToken);
    accessToken = json.data.access_token;
    refreshToken = json.data.refresh_token;
  });

  test("10. Campaign marketplace endpoint responds successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/campaign-marketplace?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.items));
  });

  test("11. Notifications endpoint responds successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.items));
  });

  test("12. Chat conversations endpoint responds successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/chat/conversations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.items));
  });

  test("13. 404 handler returns standardized JSON envelope", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/non-existent-route-xyz`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.message);
  });
});
