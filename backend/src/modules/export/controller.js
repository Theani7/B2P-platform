import * as exportService from "./service.js";
import { ok } from "../../shared/response.js";

function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

export const exportData = wrap(async (req, res) => {
  const data = await exportService.exportData(req.user, req.body);
  return ok(res, data, "Export ready", 201);
});
