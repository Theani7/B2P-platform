import * as applicationsService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

function paginated(res, items, total, page, limit, message) {
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    message
  );
}

// --- Promoter ---
export const apply = wrap(async (req, res) => {
  const app = await applicationsService.apply(req.user, req.params.id, req.body || {});
  return ok(res, { id: app.id, campaign_id: app.campaignId, status: app.status }, "Application submitted", 201);
});

export const withdraw = wrap(async (req, res) => {
  await applicationsService.withdraw(req.user, req.params.id);
  return ok(res, null, "Application withdrawn");
});

export const myApplications = wrap(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [items, total] = await applicationsService.getPromoterApplications(req.user, { page: Number(page), limit: Number(limit) });
  return paginated(res, items, total, page, limit, "Applications");
});

// --- Business ---
export const campaignApplications = wrap(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [items, total] = await applicationsService.getCampaignApplications(req.user, req.params.id, { page: Number(page), limit: Number(limit) });
  return paginated(res, items, total, page, limit, "Applications");
});

export const businessApplications = wrap(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [items, total] = await applicationsService.getBusinessApplications(req.user, { page: Number(page), limit: Number(limit) });
  return paginated(res, items, total, page, limit, "Applications");
});

export const accept = wrap(async (req, res) => {
  const collab = await applicationsService.accept(req.user, req.params.id);
  return ok(res, { id: collab.id, status: collab.status }, "Application accepted", 201);
});

export const reject = wrap(async (req, res) => {
  await applicationsService.reject(req.user, req.params.id);
  return ok(res, null, "Application rejected");
});
