import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { authenticate, requireRole } from "../src/shared/auth.js";
import { signAccessToken } from "../src/shared/jwt.js";
import { ROLE } from "../src/shared/enums.js";
import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

describe("authenticate middleware", () => {
  let user;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        username: `mw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        fullName: "MW Test",
        email: `mw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`,
        passwordHash: await bcrypt.hash("pass", 10),
        role: ROLE.PROMOTER,
        isActive: true,
        isVerified: true,
      },
    });
  });

  afterEach(async () => {
    if (user?.id) await prisma.user.deleteMany({ where: { id: user.id } });
  });

  function makeReq(headers = {}) {
    return { headers, _authenticatedUser: undefined };
  }

  function makeNext() {
    let called = false;
    const fn = (err) => { called = true; fn.err = err; };
    return fn;
  }

  test("rejects request without authorization header", async () => {
    const req = makeReq();
    const next = makeNext();
    await authenticate(req, {}, next);
    assert.ok(next.err);
    assert.equal(next.err.statusCode, 401);
  });

  test("rejects invalid token", async () => {
    const req = makeReq({ authorization: "Bearer invalid.token.here" });
    const next = makeNext();
    await authenticate(req, {}, next);
    assert.equal(next.err.statusCode, 401);
  });

  test("accepts valid token and attaches user", async () => {
    const token = signAccessToken(user.id, user.role);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const next = makeNext();
    await authenticate(req, {}, next);
    assert.equal(next.err, undefined);
    assert.ok(req.user);
    assert.equal(req.user.id, user.id);
  });

  test("rejects inactive user", async () => {
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    const token = signAccessToken(user.id, user.role);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const next = makeNext();
    await authenticate(req, {}, next);
    assert.equal(next.err.statusCode, 401);
  });
});

describe("requireRole middleware", () => {
  test("allows matching role", () => {
    const req = { user: { role: ROLE.ADMIN } };
    const next = makeNext();
    requireRole(ROLE.ADMIN)(req, {}, next);
    assert.equal(next.err, undefined);
  });

  test("rejects non-matching role with 403", () => {
    const req = { user: { role: ROLE.PROMOTER } };
    const next = makeNext();
    requireRole(ROLE.ADMIN)(req, {}, next);
    assert.equal(next.err.statusCode, 403);
  });

  test("rejects unauthenticated request", () => {
    const req = {};
    const next = makeNext();
    requireRole(ROLE.ADMIN)(req, {}, next);
    assert.equal(next.err.statusCode, 401);
  });

  function makeNext() {
    const fn = (err) => { fn.err = err; };
    return fn;
  }
});
