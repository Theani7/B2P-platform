import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { editMessageSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/conversations", controllers.listConversations);
router.get("/collaborations/:collaborationId/history", controllers.history);
router.post("/conversations/:conversationId/read", controllers.markRead);
router.patch("/messages/:messageId", validate(editMessageSchema), controllers.editMessage);
router.delete("/messages/:messageId", controllers.deleteMessage);

export default router;
