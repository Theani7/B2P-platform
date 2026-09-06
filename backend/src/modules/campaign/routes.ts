import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { campaignCreateSchema, campaignUpdateSchema, campaignListQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.BUSINESS));

router.post("/", validate(campaignCreateSchema), controllers.create);
router.get("/", validate(campaignListQuerySchema, "query"), controllers.list);
router.get("/dashboard/stats", controllers.dashboardStats);
router.get("/:id", controllers.get);
router.put("/:id", validate(campaignUpdateSchema), controllers.update);
router.delete("/:id", controllers.remove);
router.post("/:id/publish", controllers.publish);
router.post("/:id/unpublish", controllers.unpublish);
router.post("/:id/archive", controllers.archive);
router.post("/:id/reopen", controllers.reopen);

export default router;
