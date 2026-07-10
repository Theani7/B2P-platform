import * as businessService from "./service.js";
import { authenticate } from "../../shared/auth.js";
import * as discovery from "../discovery/service.js";
import { ok } from "../../shared/response.js";
import { validate } from "../../shared/validate.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";
import { businessProfileCreateSchema, businessProfileUpdateSchema } from "./validation.js";
import { savedQuerySchema } from "../discovery/validation.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const createProfile = wrap(async (req, res) => {
  const data = await businessService.createOrUpdate(req.user, req.body);
  return ok(res, data, "Profile created", 201);
});

export const readProfile = wrap(async (req, res) => {
  const data = await businessService.getMyProfile(req.user);
  return ok(res, data, "Profile");
});

export const updateProfile = wrap(async (req, res) => {
  const data = await businessService.createOrUpdate(req.user, req.body);
  return ok(res, data, "Profile updated");
});

export const deleteProfile = wrap(async (req, res) => {
  await businessService.deleteProfile(req.user);
  return ok(res, null, "Profile deleted");
});

export const addSavedPromoter = wrap(async (req, res) => {
  const saved = await businessService.savePromoter(req.user, req.params.promoterId);
  return ok(res, { id: saved.id }, "Promoter saved", 201);
});

export const deleteSavedPromoter = wrap(async (req, res) => {
  await businessService.removeSavedPromoter(req.user, req.params.promoterId);
  return ok(res, null, "Promoter removed");
});

export const listSavedPromoters = wrap(async (req, res) => {
  const { search = "", page = 1, limit = 20 } = req.query;
  const [items, total] = await businessService.getSavedPromoters(req.user, { search, page: Number(page), limit: Number(limit) });
  return ok(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) }, "Saved promoters");
});

export const analytics = wrap(async (req, res) => {
  const data = await businessService.analytics(req.user);
  return ok(res, data, "Analytics");
});
