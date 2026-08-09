import express from "express";
import rateLimit from "express-rate-limit";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { config } from "../../config/env.js";
import { exportRequestSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);
router.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: config.rateLimitExport,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many exports, please wait" },
  })
);

router.post("/", validate(exportRequestSchema), controllers.exportData);

export default router;
