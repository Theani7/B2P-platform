import * as followService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

function paginated(res, items, total, query, message) {
  const { page = 1, limit = 20 } = query;
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    message
  );
}

export const follow = wrap(async (req, res) => {
  const data = await followService.follow(req.user, req.params.userId);
  return ok(res, data, "Following", 200);
});

export const unfollow = wrap(async (req, res) => {
  const data = await followService.unfollow(req.user, req.params.userId);
  return ok(res, data, "Unfollowed");
});

export const status = wrap(async (req, res) => {
  const data = await followService.status(req.user, req.params.userId);
  return ok(res, data, "Follow status");
});

export const followers = wrap(async (req, res) => {
  const [items, total] = await followService.listFollowers(req.params.userId, req.query);
  return paginated(res, items, total, req.query, "Followers");
});

export const following = wrap(async (req, res) => {
  const [items, total] = await followService.listFollowing(req.params.userId, req.query);
  return paginated(res, items, total, req.query, "Following");
});
