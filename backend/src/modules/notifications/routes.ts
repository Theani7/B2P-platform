import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { notificationListQuerySchema, preferenceUpdateSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(notificationListQuerySchema, "query"), controllers.list);
router.get("/unread-count", controllers.unreadCount);
router.put("/:id/read", controllers.markRead);
router.put("/read-all", controllers.markAllRead);
router.delete("/:id", controllers.remove);
router.get("/preferences", controllers.getPreferences);
router.put("/preferences", validate(preferenceUpdateSchema), controllers.updatePreferences);

export default router;
