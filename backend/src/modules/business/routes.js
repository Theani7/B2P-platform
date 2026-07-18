import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { businessProfileCreateSchema, businessProfileUpdateSchema } from "./validation.js";
import { savedQuerySchema } from "../discovery/validation.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.BUSINESS));

router.post("/profile", validate(businessProfileCreateSchema), controllers.createProfile);
router.get("/profile", controllers.readProfile);
router.put("/profile", validate(businessProfileUpdateSchema), controllers.updateProfile);
router.delete("/profile", controllers.deleteProfile);

router.post("/saved-promoters/:promoterId", controllers.addSavedPromoter);
router.delete("/saved-promoters/:promoterId", controllers.deleteSavedPromoter);
router.get("/saved-promoters", validate(savedQuerySchema), controllers.listSavedPromoters);

router.get("/analytics", controllers.analytics);

export default router;
