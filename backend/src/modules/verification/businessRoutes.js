import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.BUSINESS));

router.post("/", controllers.submitBusiness);
router.get("/", controllers.listBusinessRequests);

export default router;
