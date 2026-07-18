import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { exportRequestSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.post("/", validate(exportRequestSchema), controllers.exportData);

export default router;
