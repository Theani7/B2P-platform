import express from "express";
import multer from "multer";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();
router.use(authenticate);

router.post("/avatar", upload.single("file"), controllers.uploadAvatar);
router.post("/logo", requireRole(ROLE.BUSINESS), upload.single("file"), controllers.uploadLogo);
router.post("/portfolio-image", upload.single("file"), controllers.uploadPortfolioImage);
router.post("/chat-attachment", upload.single("file"), controllers.uploadChatAttachment);

export default router;
