import * as portfolioService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";
import { validate } from "../../shared/validate.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";
import { portfolioItemCreateSchema, portfolioItemUpdateSchema } from "./validation.js";

export const listItems = wrap(async (req, res) => {
  const data = await portfolioService.list(req.user);
  return ok(res, data, "Portfolio items");
});

export const getItem = wrap(async (req, res) => {
  const data = await portfolioService.get(req.user, req.params.id);
  return ok(res, data, "Portfolio item");
});

export const createItem = wrap(async (req, res) => {
  const data = await portfolioService.create(req.user, req.body);
  return ok(res, data, "Portfolio item created", 201);
});

export const updateItem = wrap(async (req, res) => {
  const data = await portfolioService.update(req.user, req.params.id, req.body);
  return ok(res, data, "Portfolio item updated");
});

export const deleteItem = wrap(async (req, res) => {
  await portfolioService.remove(req.user, req.params.id);
  return ok(res, null, "Portfolio item deleted");
});
