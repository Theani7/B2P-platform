import * as aiService from "./service.js";
import { ok } from "../../shared/response.js";

export const generateCampaign = async (req, res, next) => {
  try {
    const result = await aiService.generateCampaignDescription(req.body.prompt);
    return ok(res, result, "Campaign description generated successfully");
  } catch (err) {
    next(err);
  }
};

export const generateProposal = async (req, res, next) => {
  try {
    const result = await aiService.generateProposalMessage(req.body.campaignDescription, req.body.promoterBackground);
    return ok(res, result, "Proposal message generated successfully");
  } catch (err) {
    next(err);
  }
};

export const generateSocial = async (req, res, next) => {
  try {
    const result = await aiService.generateSocialContent(req.body.topic, req.body.platform);
    return ok(res, result, "Social content generated successfully");
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const result = await aiService.chatWithAssistant({
      message: req.body.message,
      role: req.body.role || req.user?.role,
      history: req.body.history,
      user: req.user,
      campaignId: req.body.campaignId,
    });
    return ok(res, result, "Response generated successfully");
  } catch (err) {
    next(err);
  }
};
