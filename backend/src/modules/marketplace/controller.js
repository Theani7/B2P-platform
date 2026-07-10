import * as marketplaceService from "./service.js";
import { ok } from "../../shared/response.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const list = wrap(async (req, res) => {
  const [items, total] = await marketplaceService.listMarketplaceCampaigns(req.user, req.query);
  const { page = 1, limit = 20 } = req.query;
  return ok(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) }, "Marketplace campaigns");
});

export const bookmark = wrap(async (req, res) => {
  const data = await marketplaceService.toggleBookmark(req.user, req.params.campaignId, true);
  return ok(res, data, "Campaign bookmarked");
});

export const removeBookmark = wrap(async (req, res) => {
  const data = await marketplaceService.toggleBookmark(req.user, req.params.campaignId, false);
  return ok(res, data, "Bookmark removed");
});
