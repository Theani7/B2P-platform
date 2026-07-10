import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { matchesQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

const business = requireRole(ROLE.BUSINESS);

router.post("/campaigns/:campaignId/generate-matches", business, controllers.generate);
router.get("/campaigns/:campaignId/matches", business, validate(matchesQuerySchema, "query"), controllers.list);

export default router;
