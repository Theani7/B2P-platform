import * as promoterService from "./service.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ok } from "../../shared/response.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { promoterProfileCreateSchema, promoterProfileUpdateSchema } from "./validation.js";
import { directoryQuerySchema } from "../discovery/validation.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const createProfile = wrap(async (req, res) => {
  const data = await promoterService.createOrUpdate(req.user, req.body);
  return ok(res, data, "Profile created", 201);
});

export const readProfile = wrap(async (req, res) => {
  const data = await promoterService.getMyProfile(req.user);
  return ok(res, data, "Profile");
});

export const updateProfile = wrap(async (req, res) => {
  const data = await promoterService.createOrUpdate(req.user, req.body);
  return ok(res, data, "Profile updated");
});

export const deleteProfile = wrap(async (req, res) => {
  await promoterService.deleteProfile(req.user);
  return ok(res, null, "Profile deleted");
});

export const analytics = wrap(async (req, res) => {
  const data = await promoterService.analytics(req.user);
  return ok(res, data, "Analytics");
});
