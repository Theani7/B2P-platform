import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { promoterProfileCreateSchema, promoterProfileUpdateSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.PROMOTER));

router.post("/profile", validate(promoterProfileCreateSchema), controllers.createProfile);
router.get("/profile", controllers.readProfile);
router.put("/profile", validate(promoterProfileUpdateSchema), controllers.updateProfile);
router.delete("/profile", controllers.deleteProfile);

router.get("/analytics", controllers.analytics);

export default router;
