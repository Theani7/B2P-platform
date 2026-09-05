import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { marketplaceListQuerySchema } from "./validation.js";

const router = express.Router();

const promoter = requireRole(ROLE.PROMOTER);

router.get("/campaign-marketplace", authenticate, validate(marketplaceListQuerySchema, "query"), controllers.list);
router.post("/campaign-marketplace/:campaignId/bookmark", authenticate, promoter, controllers.bookmark);
router.delete("/campaign-marketplace/:campaignId/bookmark", authenticate, promoter, controllers.removeBookmark);

export default router;
