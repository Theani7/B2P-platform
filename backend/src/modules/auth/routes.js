import express from "express";
import * as validators from "./validation.js";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { ROLE } from "../../shared/enums.js";

const router = express.Router();

router.post("/register", validate(validators.registerSchema), controllers.register);
router.post("/login", validate(validators.loginSchema), controllers.login);
router.post("/logout", authenticate, controllers.logout);
router.post("/refresh", validate(validators.refreshSchema), controllers.refresh);
router.post("/verify-email", validate(validators.verifyEmailSchema), controllers.verifyEmail);
router.post("/forgot-password", validate(validators.forgotPasswordSchema), controllers.forgotPassword);
router.post("/reset-password", validate(validators.resetPasswordSchema), controllers.resetPassword);
router.get("/me", authenticate, controllers.me);
router.patch("/me", authenticate, validate(validators.updateMeSchema), controllers.updateMe);

router.get("/admin/debug", authenticate, requireRole(ROLE.ADMIN), controllers.adminDebug);
router.get("/business/reports", authenticate, requireRole(ROLE.BUSINESS), controllers.businessReports);
router.get("/promoter/campaigns", authenticate, requireRole(ROLE.PROMOTER), controllers.promoterCampaigns);

export default router;
