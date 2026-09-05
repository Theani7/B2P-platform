import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";
import { inviteSchema, listQuerySchema } from "./validation.js";

const router = express.Router();

const promoter = requireRole(ROLE.PROMOTER);
const business = requireRole(ROLE.BUSINESS);

// --- Business ---
router.post("/campaigns/:id/invite/:promoterId", authenticate, business, validate(inviteSchema), controllers.invite);
router.delete("/invitations/:id", authenticate, business, controllers.cancel);
router.get("/business/invitations", authenticate, business, validate(listQuerySchema, "query"), controllers.businessInvitations);

// --- Promoter ---
router.get("/promoter/invitations", authenticate, promoter, validate(listQuerySchema, "query"), controllers.promoterInvitations);
router.post("/invitations/:id/accept", authenticate, promoter, controllers.accept);
router.post("/invitations/:id/reject", authenticate, promoter, controllers.reject);

export default router;
