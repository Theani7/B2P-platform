import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { campaignShareParamsSchema } from "./service.js";

const router = express.Router();
router.use(authenticate);

router.get("/profile", controllers.profile);
router.get("/campaign/:campaignId", validate(campaignShareParamsSchema, "params"), controllers.campaign);

export default router;
