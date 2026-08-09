import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../src/shared/response.js";
import { AppError, errorHandler } from "../src/shared/errors.js";

function mockRes() {
  const res = {
    statusCode: 200,
    _json: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this._json = data; return this; },
  };
  return res;
}

describe("API envelope", () => {
  test("ok() returns {success:true, data, message}", () => {
    const res = mockRes();
    ok(res, { id: 1 }, "Created", 201);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res._json, { success: true, data: { id: 1 }, message: "Created" });
  });

  test("ok() defaults to 200 and 'Success'", () => {
    const res = mockRes();
    ok(res, "done");
    assert.equal(res.statusCode, 200);
    assert.equal(res._json.message, "Success");
  });

  test("AppError returns {success:false, message, errors}", () => {
    const res = mockRes();
    const err = new AppError("Bad input", 422, [{ field: "email" }]);
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 422);
    assert.equal(res._json.success, false);
    assert.equal(res._json.message, "Bad input");
    assert.deepEqual(res._json.errors, [{ field: "email" }]);
  });

  test("unknown error returns 500 with safe message", () => {
    const res = mockRes();
    errorHandler(new Error("secret DB string"), {}, res, () => {});
    assert.equal(res.statusCode, 500);
    assert.equal(res._json.success, false);
    assert.equal(res._json.message, "Internal server error");
  });
});
