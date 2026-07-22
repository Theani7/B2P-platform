import express from "express";
import { incrementViews, toggleLike } from "./service.js";
import { ok } from "../../shared/response.js";
import { wrap } from "../../shared/errors.js";
import { authenticate } from "../../shared/auth.js";

const router = express.Router();

router.post("/:id/view", wrap(async (req, res) => {
  const item = await incrementViews(req.params.id);
  return ok(res, item, "View recorded");
}));

router.post("/:id/like", authenticate, wrap(async (req, res) => {
  const item = await toggleLike(req.user, req.params.id);
  return ok(res, item, "Like toggled");
}));

export default router;
