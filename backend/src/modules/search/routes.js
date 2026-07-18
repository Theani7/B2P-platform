import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { searchQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(searchQuerySchema, "query"), controllers.search);
router.get("/history", controllers.history);
router.delete("/history", controllers.clear);

export default router;
