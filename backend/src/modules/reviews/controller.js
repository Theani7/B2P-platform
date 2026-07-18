import * as reviewService from "./service.js";
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

export const create = wrap(async (req, res) => {
  const data = await reviewService.createReview(req.user, req.params.collaborationId, req.body);
  return ok(res, data, "Review created", 201);
});

export const update = wrap(async (req, res) => {
  const data = await reviewService.updateReview(req.user, req.params.reviewId, req.body);
  return ok(res, data, "Review updated");
});

export const remove = wrap(async (req, res) => {
  await reviewService.deleteReview(req.user, req.params.reviewId);
  return ok(res, null, "Review deleted");
});

export const myReviews = wrap(async (req, res) => {
  const [items, total] = await reviewService.getMyReviews(req.user, req.query);
  return paginated(res, items, total, req.query, "My reviews");
});

export const myReceivedReviews = wrap(async (req, res) => {
  const [items, total] = await reviewService.getReceivedReviews(req.user.id, req.query);
  return paginated(res, items, total, req.query, "Received reviews");
});

export const userReviews = wrap(async (req, res) => {
  const [items, total] = await reviewService.getUserReviews(req.params.userId, req.query);
  return paginated(res, items, total, req.query, "User reviews");
});

export const userRating = wrap(async (req, res) => {
  const data = await reviewService.getRatingSummary(req.params.userId);
  return ok(res, data, "Rating summary");
});

export const complete = wrap(async (req, res) => {
  await reviewService.completeCollaboration(req.user, req.params.collaborationId);
  return ok(res, { success: true }, "Collaboration completed");
});
