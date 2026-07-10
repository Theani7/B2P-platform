import * as campaignService from "./service.js";
import { ok } from "../../shared/response.js";

function wrap(fn) {
  return async (req, res, next) => {
    try { await fn(req, res, next); } catch (e) { next(e); }
  };
}

export const create = wrap(async (req, res) => {
  const data = await campaignService.create(req.user, req.body);
  return ok(res, data, "Campaign created", 201);
});

export const list = wrap(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const [items, total] = await campaignService.list(req.user, req.query);
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    "Campaigns"
  );
});

export const dashboardStats = wrap(async (req, res) => {
  const data = await campaignService.dashboardStats(req.user);
  return ok(res, data, "Dashboard stats");
});

export const get = wrap(async (req, res) => {
  const data = await campaignService.get(req.user, req.params.id);
  return ok(res, data, "Campaign");
});

export const update = wrap(async (req, res) => {
  const data = await campaignService.update(req.user, req.params.id, req.body);
  return ok(res, data, "Campaign updated");
});

export const remove = wrap(async (req, res) => {
  await campaignService.remove(req.user, req.params.id);
  return ok(res, null, "Campaign deleted");
});

export const publish = wrap(async (req, res) => {
  const data = await campaignService.publish(req.user, req.params.id);
  return ok(res, data, "Campaign published");
});

export const unpublish = wrap(async (req, res) => {
  const data = await campaignService.unpublish(req.user, req.params.id);
  return ok(res, data, "Campaign unpublished");
});

export const archive = wrap(async (req, res) => {
  const data = await campaignService.archive(req.user, req.params.id);
  return ok(res, data, "Campaign archived");
});

export const reopen = wrap(async (req, res) => {
  const data = await campaignService.reopen(req.user, req.params.id);
  return ok(res, data, "Campaign reopened");
});
