import * as socialService from "./service.js";
import { ok } from "../../shared/response.js";
import { validate } from "../../shared/validate.js";
import { authenticate } from "../../shared/auth.js";
import { socialLinkCreateSchema, socialLinkUpdateSchema } from "./validation.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const listLinks = wrap(async (req, res) => {
  const data = await socialService.list(req.user);
  return ok(res, data, "Social links");
});

export const getLink = wrap(async (req, res) => {
  const data = await socialService.get(req.user, req.params.id);
  return ok(res, data, "Social link");
});

export const createLink = wrap(async (req, res) => {
  const data = await socialService.create(req.user, req.body);
  return ok(res, data, "Social link created", 201);
});

export const updateLink = wrap(async (req, res) => {
  const data = await socialService.update(req.user, req.params.id, req.body);
  return ok(res, data, "Social link updated");
});

export const deleteLink = wrap(async (req, res) => {
  await socialService.remove(req.user, req.params.id);
  return ok(res, null, "Social link deleted");
});
