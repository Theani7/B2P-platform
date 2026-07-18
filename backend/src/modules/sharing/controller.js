import * as sharingService from "./service.js";
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

export const profile = wrap(async (req, res) => {
  const data = sharingService.getProfileShare(req.user);
  return ok(res, data, "Shareable profile");
});

export const campaign = wrap(async (req, res) => {
  const data = await sharingService.getCampaignShare(req.user, req.params.campaignId);
  return ok(res, data, "Shareable campaign link");
});
