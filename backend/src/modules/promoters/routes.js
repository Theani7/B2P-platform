import express from "express";
import { wrap } from "../../shared/errors.js";
import * as discovery from "../discovery/service.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ok } from "../../shared/response.js";
import { ROLE } from "../../shared/enums.js";
import { directoryQuerySchema } from "../discovery/validation.js";

const router = express.Router();

// Public promoter profile (no auth)
router.get("/:username", wrap(async (req, res) => {
  const data = await discovery.getPublicProfile(req.params.username);
  return ok(res, data, "Promoter profile");
}));

// Promoter directory (BUSINESS only)
router.get(
  "/",
  authenticate,
  requireRole(ROLE.BUSINESS),
  validate(directoryQuerySchema, "query"),
  wrap(async (req, res) => {
    const p = req.query;
    const [items, total] = await discovery.searchPromoters(p);
    return ok(
      res,
      { items, total, page: p.page, limit: p.limit, pages: Math.max(1, Math.ceil(total / p.limit)) },
      "Directory"
    );
  })
);

export default router;
