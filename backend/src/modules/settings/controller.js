import * as settingsService from "./service.js";
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

export const publicSettings = wrap(async (req, res) => {
  const data = await settingsService.getPublicSettings();
  return ok(res, data, "Platform settings");
});

export const account = wrap(async (req, res) => {
  const data = await settingsService.getAccountSettings(req.user);
  return ok(res, data, "Account settings");
});
