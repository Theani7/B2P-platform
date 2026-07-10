import * as notificationService from "./service.js";
import { ok } from "../../shared/response.js";
import { AppError } from "../../shared/errors.js";

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
  const { page = 1, limit = 50 } = query;
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    message
  );
}

export const list = wrap(async (req, res) => {
  const [items, total] = await notificationService.listNotifications(req.user, req.query);
  return paginated(res, items, total, req.query, "Notifications");
});

export const unreadCount = wrap(async (req, res) => {
  const count = await notificationService.unreadCount(req.user);
  return ok(res, { count }, "Unread count");
});

export const markRead = wrap(async (req, res) => {
  const notification = await notificationService.markRead(req.user, req.params.id);
  if (!notification) throw new AppError("Notification not found", 404);
  return ok(res, { success: true }, "Notification marked as read");
});

export const markAllRead = wrap(async (req, res) => {
  const updated = await notificationService.markAllRead(req.user);
  return ok(res, { updatedCount: updated }, "All notifications marked as read");
});

export const remove = wrap(async (req, res) => {
  const okDel = await notificationService.removeNotification(req.user, req.params.id);
  if (!okDel) throw new AppError("Notification not found", 404);
  return ok(res, null, "Notification deleted");
});

export const getPreferences = wrap(async (req, res) => {
  const prefs = await notificationService.getPreferences(req.user);
  return ok(res, { preferences: prefs }, "Notification preferences");
});

export const updatePreferences = wrap(async (req, res) => {
  const prefs = await notificationService.updatePreferences(req.user, req.body.preferences);
  return ok(res, { preferences: prefs }, "Notification preferences updated");
});
