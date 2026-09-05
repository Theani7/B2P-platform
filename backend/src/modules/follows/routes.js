import express from "express";
import * as controllers from "./controller.js";
import { validate } from "../../shared/validate.js";
import { authenticate } from "../../shared/auth.js";
import { followParamsSchema, followListQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

router.get("/:userId/status", validate(followParamsSchema, "params"), controllers.status);
router.get("/:userId/followers", validate(followParamsSchema, "params"), validate(followListQuerySchema, "query"), controllers.followers);
router.get("/:userId/following", validate(followParamsSchema, "params"), validate(followListQuerySchema, "query"), controllers.following);
router.post("/:userId", validate(followParamsSchema, "params"), controllers.follow);
router.delete("/:userId", validate(followParamsSchema, "params"), controllers.unfollow);

export default router;
