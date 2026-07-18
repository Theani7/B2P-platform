import * as collaborationService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const businessList = wrap(async (req, res) => {
  const [items, total] = await collaborationService.listBusinessCollaborations(req.user, req.query);
  const { page = 1, limit = 20 } = req.query;
  return ok(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) }, "Collaborations");
});

export const promoterList = wrap(async (req, res) => {
  const [items, total] = await collaborationService.listPromoterCollaborations(req.user, req.query);
  const { page = 1, limit = 20 } = req.query;
  return ok(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) }, "Collaborations");
});

export const businessDeliverables = wrap(async (req, res) => {
  const items = await collaborationService.getDeliverables(req.user, req.params.id);
  return ok(res, items, "Deliverables");
});

export const promoterDeliverables = wrap(async (req, res) => {
  const items = await collaborationService.getDeliverables(req.user, req.params.id);
  return ok(res, items, "Deliverables");
});

export const submitDeliverable = wrap(async (req, res) => {
  const data = await collaborationService.createDeliverable(req.user, req.params.id, req.body);
  return ok(res, data, "Deliverable submitted", 201);
});

export const reviewDeliverable = wrap(async (req, res) => {
  const data = await collaborationService.reviewDeliverable(req.user, req.params.id, req.params.deliverableId, req.body);
  return ok(res, data, "Deliverable reviewed");
});
