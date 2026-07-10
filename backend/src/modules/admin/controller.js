import * as adminService from "./service.js";
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

function paginated(res, items, total, query, message) {
  const { page = 1, limit = 20 } = query;
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    message
  );
}

export const dashboard = wrap(async (req, res) => {
  const data = await adminService.getDashboardStats();
  return ok(res, data, "Dashboard stats");
});

export const listUsers = wrap(async (req, res) => {
  const [items, total] = await adminService.getAdminUsers(req.query);
  return paginated(res, items, total, req.query, "Users");
});

export const getUser = wrap(async (req, res) => {
  const data = await adminService.getAdminUserDetail(req.params.userId);
  return ok(res, data, "User detail");
});

export const suspend = wrap(async (req, res) => {
  const data = await adminService.suspendUser(req.user, req.params.userId, req);
  return ok(res, data, "User suspended");
});

export const activate = wrap(async (req, res) => {
  const data = await adminService.activateUser(req.user, req.params.userId, req);
  return ok(res, data, "User activated");
});

export const remove = wrap(async (req, res) => {
  const data = await adminService.deleteUser(req.user, req.params.userId, req);
  return ok(res, data, "User deleted");
});

export const listCampaigns = wrap(async (req, res) => {
  const [items, total] = await adminService.getAdminCampaigns(req.query);
  return paginated(res, items, total, req.query, "Campaigns");
});

export const archiveCampaign = wrap(async (req, res) => {
  const data = await adminService.archiveCampaign(req.user, req.params.campaignId, req);
  return ok(res, data, "Campaign archived");
});

export const cancelCampaign = wrap(async (req, res) => {
  const data = await adminService.cancelCampaign(req.user, req.params.campaignId, req);
  return ok(res, data, "Campaign cancelled");
});

export const listReviews = wrap(async (req, res) => {
  const [items, total] = await adminService.getAdminReviews(req.query);
  return paginated(res, items, total, req.query, "Reviews");
});

export const deleteReview = wrap(async (req, res) => {
  const data = await adminService.deleteReview(req.user, req.params.reviewId, req);
  return ok(res, data, "Review deleted");
});

export const auditLogs = wrap(async (req, res) => {
  const [items, total] = await adminService.getAuditLogs(req.query);
  return paginated(res, items, total, req.query, "Audit logs");
});

export const settings = wrap(async (req, res) => {
  const data = await adminService.getSettings();
  return ok(res, data, "Platform settings");
});

export const seedSettings = wrap(async (req, res) => {
  const data = await adminService.seedSettings();
  return ok(res, data, "Default settings seeded");
});

export const updateSetting = wrap(async (req, res) => {
  const data = await adminService.updateSetting(
    req.user,
    req.params.key,
    req.body.settingValue,
    req.body.description,
    req
  );
  return ok(res, data, "Setting updated");
});

export const deleteSetting = wrap(async (req, res) => {
  const data = await adminService.deleteSetting(req.params.key);
  return ok(res, data, "Setting deleted");
});

export const analytics = wrap(async (req, res) => {
  const data = await adminService.getAnalytics();
  return ok(res, data, "Analytics");
});
