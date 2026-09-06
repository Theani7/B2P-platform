import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import rateLimit from "express-rate-limit";
import { deliverableCreateSchema, deliverableReviewSchema, collaborationListQuerySchema } from "./validation.js";

const router = express.Router();

const promoter = requireRole(ROLE.PROMOTER);
const business = requireRole(ROLE.BUSINESS);

const deliverableLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { success: false, message: "Too many deliverables submitted. Please try again later." },
});

// --- Business ---
router.get("/business/collaborations", authenticate, business, validate(collaborationListQuerySchema, "query"), controllers.businessList);
router.get("/business/collaborations/:id/deliverables", authenticate, business, controllers.businessDeliverables);
router.patch("/business/collaborations/:id/deliverables/:deliverableId/review", authenticate, business, validate(deliverableReviewSchema), controllers.reviewDeliverable);

// --- Promoter ---
router.get("/promoter/collaborations", authenticate, promoter, validate(collaborationListQuerySchema, "query"), controllers.promoterList);
router.get("/promoter/collaborations/:id/deliverables", authenticate, promoter, controllers.promoterDeliverables);
router.post("/promoter/collaborations/:id/deliverables", authenticate, promoter, deliverableLimiter, validate(deliverableCreateSchema), controllers.submitDeliverable);

export default router;
