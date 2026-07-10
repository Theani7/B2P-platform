import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { activityListQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/me", validate(activityListQuerySchema, "query"), controllers.myActivities);
router.get("/business", requireRole(ROLE.BUSINESS), validate(activityListQuerySchema, "query"), controllers.businessActivities);
router.get("/admin", requireRole(ROLE.ADMIN), validate(activityListQuerySchema, "query"), controllers.adminActivities);

export default router;
