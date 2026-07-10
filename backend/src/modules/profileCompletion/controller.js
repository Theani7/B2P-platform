import * as completionService from "./service.js";
import { ok } from "../../shared/response.js";
import { authenticate } from "../../shared/auth.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const getCompletion = wrap(async (req, res) => {
  const data = await completionService.getCompletion(req.user);
  return ok(res, data, "Profile completion");
});
