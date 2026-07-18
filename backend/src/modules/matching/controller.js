import * as matchingService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const generate = wrap(async (req, res) => {
  const count = await matchingService.generateMatches(req.user, req.params.campaignId);
  return ok(res, { totalMatches: count }, `Generated ${count} match results`, 201);
});

export const list = wrap(async (req, res) => {
  const [items, total] = await matchingService.getMatches(req.user, req.params.campaignId, req.query);
  const { page = 1, limit = 10 } = req.query;
  return ok(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) }, "Match results");
});
