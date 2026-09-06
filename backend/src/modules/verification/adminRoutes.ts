import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { reviewSchema, listQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.ADMIN));

router.get("/", validate(listQuerySchema, "query"), controllers.listRequests);
router.post("/:id/approve", validate(reviewSchema), controllers.approve);
router.post("/:id/reject", validate(reviewSchema), controllers.reject);

export default router;
