import { Router } from "express";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import * as controller from "./controller.js";
import * as schema from "./validation.js";

const router = Router();

router.use(authenticate);

router.post("/generate/campaign", validate(schema.generateCampaignSchema), controller.generateCampaign);
router.post("/generate/proposal", validate(schema.generateProposalSchema), controller.generateProposal);
router.post("/generate/social", validate(schema.generateSocialSchema), controller.generateSocial);
router.post("/chat", validate(schema.chatSchema), controller.chat);

export default router;
