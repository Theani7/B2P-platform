import * as activityService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

function paginated(res, items, total, query, message) {
  const { page = 1, size = 20 } = query;
  return ok(
    res,
    { items, total, page: Number(page), size: Number(size), pages: Math.max(1, Math.ceil(total / Number(size))) },
    message
  );
}

export const myActivities = wrap(async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  const [items, total] = await activityService.getMyActivities(req.user, page, size);
  return paginated(res, items, total, req.query, "My activities");
});

export const businessActivities = wrap(async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  const [items, total] = await activityService.getBusinessActivities(req.user, page, size);
  return paginated(res, items, total, req.query, "Business activities");
});

export const adminActivities = wrap(async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  const [items, total] = await activityService.getAdminActivities(page, size);
  return paginated(res, items, total, req.query, "Admin activities");
});
