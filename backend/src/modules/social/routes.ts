import express from "express";
import * as controllers from "./controller.js";
import { validate } from "../../shared/validate.js";
import { authenticate } from "../../shared/auth.js";
import { socialLinkCreateSchema, socialLinkUpdateSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/", controllers.listLinks);
router.post("/", validate(socialLinkCreateSchema), controllers.createLink);
router.get("/:id", controllers.getLink);
router.put("/:id", validate(socialLinkUpdateSchema), controllers.updateLink);
router.delete("/:id", controllers.deleteLink);

export default router;
