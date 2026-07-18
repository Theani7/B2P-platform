import * as settingsService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const publicSettings = wrap(async (req, res) => {
  const data = await settingsService.getPublicSettings();
  return ok(res, data, "Platform settings");
});

export const account = wrap(async (req, res) => {
  const data = await settingsService.getAccountSettings(req.user);
  return ok(res, data, "Account settings");
});
