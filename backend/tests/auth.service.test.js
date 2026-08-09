import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/config/db.js";
import { ROLE } from "../src/shared/enums.js";
import * as auth from "../src/modules/auth/service.js";
import bcrypt from "bcryptjs";

describe("auth.service", () => {
  let user;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        username: `test_${Date.now()}`,
        fullName: "Test User",
        email: `test_${Date.now()}@test.com`,
        passwordHash: await bcrypt.hash("password123", 10),
        role: ROLE.PROMOTER,
        isActive: true,
        isVerified: true,
      },
    });
  });

  afterEach(async () => {
    await prisma.revokedRefreshToken.deleteMany();
    if (user?.id) await prisma.user.deleteMany({ where: { id: user.id } });
  });

  test("login succeeds with valid credentials", async () => {
    const tokens = await auth.login({ email: user.email, password: "password123" });
    assert.ok(tokens.access_token);
    assert.ok(tokens.refresh_token);
    assert.equal(tokens.token_type, "bearer");
  });

  test("login fails with invalid password", async () => {
    await assert.rejects(
      () => auth.login({ email: user.email, password: "wrongpassword" }),
      { message: "Invalid credentials" }
    );
  });

  test("login fails for inactive user", async () => {
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    await assert.rejects(
      () => auth.login({ email: user.email, password: "password123" }),
      { message: "User is deactivated" }
    );
  });

  test("login fails for unverified user", async () => {
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: false } });
    await assert.rejects(
      () => auth.login({ email: user.email, password: "password123" }),
      { message: /verify your email/i }
    );
  });

  test("refresh rotates and revokes old token", async () => {
    const tokens = await auth.login({ email: user.email, password: "password123" });
    const newTokens = await auth.refresh(tokens.refresh_token);
    assert.ok(newTokens.access_token);
    assert.notEqual(newTokens.refresh_token, tokens.refresh_token);

    await assert.rejects(
      () => auth.refresh(tokens.refresh_token),
      { message: "Refresh token revoked" }
    );
  });

  test("account locks after max failed attempts", async () => {
    for (let i = 0; i < 5; i++) {
      try { await auth.login({ email: user.email, password: "wrong" }); } catch {}
    }
    await assert.rejects(
      () => auth.login({ email: user.email, password: "wrong" }),
      { message: /locked/i }
    );
  });

  test("register rejects duplicate email", async () => {
    await assert.rejects(
      () => auth.register({
        email: user.email,
        password: "password123",
        username: "unique123",
        fullName: "New User",
        role: ROLE.PROMOTER,
      }),
      { message: /already registered/i }
    );
  });
});
