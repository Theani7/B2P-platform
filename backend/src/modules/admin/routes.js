import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";
import { validate } from "../../shared/validate.js";
import {
  adminUserQuerySchema,
  adminCampaignQuerySchema,
  adminReviewQuerySchema,
  settingUpdateSchema,
} from "./validation.js";


const router = express.Router();
router.use(authenticate, requireRole(ROLE.ADMIN));

router.get("/dashboard", controllers.dashboard);
router.get("/users", validate(adminUserQuerySchema, "query"), controllers.listUsers);
router.get("/users/:userId", controllers.getUser);
router.patch("/users/:userId/suspend", controllers.suspend);
router.patch("/users/:userId/activate", controllers.activate);
router.delete("/users/:userId", controllers.remove);

router.get("/campaigns", validate(adminCampaignQuerySchema, "query"), controllers.listCampaigns);
router.patch("/campaigns/:campaignId/archive", controllers.archiveCampaign);
router.patch("/campaigns/:campaignId/cancel", controllers.cancelCampaign);

router.get("/reviews", validate(adminReviewQuerySchema, "query"), controllers.listReviews);
router.delete("/reviews/:reviewId", controllers.deleteReview);



router.get("/settings", controllers.settings);
router.post("/settings/seed", controllers.seedSettings);
router.put("/settings/:key", validate(settingUpdateSchema), controllers.updateSetting);
router.delete("/settings/:key", controllers.deleteSetting);

router.get("/analytics", controllers.analytics);

export default router;
