import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";
import { z } from "zod";
import { validate } from "../../shared/validate.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.PROMOTER));

const addMediaSchema = z.object({
  filePath: z.string().max(500),
  mediaType: z.string().max(50).optional(),
});

router.get("/:id/media", controllers.listMedia);
router.post("/:id/media", validate(addMediaSchema), controllers.addMedia);
router.delete("/:id/media/:mediaId", controllers.removeMedia);

export default router;
