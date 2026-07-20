import express from "express";
import * as validators from "./validation.js";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";

const router = express.Router();

router.get("/check", validate(validators.checkSchema, "query"), controllers.check);
router.post("/register", validate(validators.registerSchema), controllers.register);
router.post("/resend-verification", validate(validators.resendVerificationSchema), controllers.resendVerification);
router.post("/login", validate(validators.loginSchema), controllers.login);
router.post("/logout", authenticate, controllers.logout);
router.post("/refresh", validate(validators.refreshSchema), controllers.refresh);
router.post("/verify-email", validate(validators.verifyEmailSchema), controllers.verifyEmail);
router.post("/forgot-password", validate(validators.forgotPasswordSchema), controllers.forgotPassword);
router.post("/verify-reset-code", validate(validators.verifyResetCodeSchema), controllers.verifyResetCode);
router.post("/reset-password", validate(validators.resetPasswordSchema), controllers.resetPassword);
router.post("/request-otp", validate(validators.requestOtpSchema), controllers.requestOtp);
router.post("/verify-otp", validate(validators.verifyOtpSchema), controllers.verifyOtp);
router.post("/verify-registration-otp", validate(validators.verifyOtpSchema), controllers.verifyRegistrationOtp);
router.post("/resend-registration-otp", validate(validators.resendVerificationSchema), controllers.resendRegistrationOtp);
router.get("/me", authenticate, controllers.me);
router.patch("/me", authenticate, validate(validators.updateMeSchema), controllers.updateMe);

export default router;
