import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { applySchema, listQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

const promoter = requireRole(ROLE.PROMOTER);
const business = requireRole(ROLE.BUSINESS);

// --- Promoter ---
router.post("/campaigns/:id/apply", promoter, validate(applySchema), controllers.apply);
router.delete("/applications/:id", promoter, controllers.withdraw);
router.get("/promoter/applications", promoter, validate(listQuerySchema, "query"), controllers.myApplications);

// --- Business ---
router.get("/campaigns/:id/applications", business, validate(listQuerySchema, "query"), controllers.campaignApplications);
router.get("/business/applications", business, validate(listQuerySchema, "query"), controllers.businessApplications);
router.post("/applications/:id/accept", business, controllers.accept);
router.post("/applications/:id/reject", business, controllers.reject);

export default router;
