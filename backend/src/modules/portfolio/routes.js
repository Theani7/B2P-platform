import express from "express";
import * as controllers from "./controller.js";
import { validate } from "../../shared/validate.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";
import { portfolioItemCreateSchema, portfolioItemUpdateSchema } from "./validation.js";

const router = express.Router();
router.use(authenticate, requireRole(ROLE.PROMOTER));

router.get("/", controllers.listItems);
router.post("/", validate(portfolioItemCreateSchema), controllers.createItem);
router.get("/:id", controllers.getItem);
router.put("/:id", validate(portfolioItemUpdateSchema), controllers.updateItem);
router.delete("/:id", controllers.deleteItem);

export default router;
