import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { requireRole } from "../../shared/auth.js";
import { ROLE } from "../../shared/enums.js";

const router = express.Router();
router.use(authenticate);

// Catalog of achievement definitions (any authenticated user).
router.get("/", controllers.list);

// Authenticated user progress + admin recalculation.
router.get("/me", controllers.myAchievements);
router.get("/users/:userId/achievements", controllers.userAchievements);
router.post("/recalculate", requireRole(ROLE.ADMIN), controllers.recalculate);

export default router;
