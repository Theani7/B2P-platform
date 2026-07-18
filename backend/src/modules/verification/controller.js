import * as verificationService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

// --- Business (self-service) ---
export const submitBusiness = wrap(async (req, res) => {
  const vr = await verificationService.submitBusiness(req.user, req);
  return ok(res, { id: vr.id, status: vr.status }, "Verification request submitted", 201);
});

export const listBusinessRequests = wrap(async (req, res) => {
  const data = await verificationService.getMyBusinessRequests(req.user);
  return ok(res, data, "Verification requests");
});

// --- Promoter (self-service) ---
export const submitPromoter = wrap(async (req, res) => {
  const vr = await verificationService.submitPromoter(req.user, req);
  return ok(res, { id: vr.id, status: vr.status }, "Verification request submitted", 201);
});

export const listPromoterRequests = wrap(async (req, res) => {
  const data = await verificationService.getMyPromoterRequests(req.user);
  return ok(res, data, "Verification requests");
});

// --- Admin ---
export const listRequests = wrap(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const [items, total] = await verificationService.listRequests({ status, page: Number(page), limit: Number(limit) });
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    "Verification requests"
  );
});

export const approve = wrap(async (req, res) => {
  const data = await verificationService.approve(req.user, req.params.id, req.body?.adminNotes, req);
  return ok(res, data, "Verification approved");
});

export const reject = wrap(async (req, res) => {
  const data = await verificationService.reject(req.user, req.params.id, req.body?.adminNotes, req);
  return ok(res, data, "Verification rejected");
});
