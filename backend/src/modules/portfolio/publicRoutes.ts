import express from "express";
import { incrementViews, toggleLike } from "./service.js";
import { ok } from "../../shared/response.js";
import { wrap } from "../../shared/errors.js";
import { authenticate } from "../../shared/auth.js";
import { prisma } from "../../config/db.js";

const router = express.Router();

router.post("/:id/view", wrap(async (req, res) => {
  const item = await incrementViews(req.params.id);
  return ok(res, item, "View recorded");
}));

router.get("/:id/like", authenticate, wrap(async (req, res) => {
  const existing = await prisma.portfolioLike.findUnique({
    where: { portfolioItemId_userId: { portfolioItemId: req.params.id, userId: req.user.id } },
  });
  return ok(res, { hasLiked: !!existing }, "Like status");
}));

router.post("/:id/like", authenticate, wrap(async (req, res) => {
  const item = await toggleLike(req.user, req.params.id);
  return ok(res, item, "Like toggled");
}));

export default router;
