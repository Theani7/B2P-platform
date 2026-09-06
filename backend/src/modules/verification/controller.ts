import * as verificationService from "./service.js";
import { wrap, AppError } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";
import { submitVerificationSchema } from "./validation.js";

// --- Business (self-service) ---
export const submitBusiness = wrap(async (req, res) => {
  const parsed = submitVerificationSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new AppError("Validation failed", 422, errors);
  }
  const vr = await verificationService.submitBusiness(req.user, parsed.data, req);
  return ok(res, { id: vr.id, status: vr.status }, "Verification request submitted", 201);
});

export const listBusinessRequests = wrap(async (req, res) => {
  const data = await verificationService.getMyBusinessRequests(req.user);
  return ok(res, data, "Verification requests");
});

// --- Promoter (self-service) ---
export const submitPromoter = wrap(async (req, res) => {
  const parsed = submitVerificationSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new AppError("Validation failed", 422, errors);
  }
  const vr = await verificationService.submitPromoter(req.user, parsed.data, req);
  return ok(res, { id: vr.id, status: vr.status }, "Verification request submitted", 201);
});

export const listPromoterRequests = wrap(async (req, res) => {
  const data = await verificationService.getMyPromoterRequests(req.user);
  return ok(res, data, "Verification requests");
});

// --- Admin ---
export const listRequests = wrap(async (req, res) => {
  const { status, page = 1, limit = 20 }: any = req.query;
  const [items, total]: any = await verificationService.listRequests({ status, page: Number(page), limit: Number(limit) });
  const mapped = items.map((vr: any) => {
    const isPromoter = !!vr.promoterProfileId;
    const profile = isPromoter ? vr.promoterProfile : vr.businessProfile;
    return {
      id: vr.id,
      status: vr.status,
      requester_name: isPromoter ? profile?.username : profile?.companyName ?? "",
      requester_type: isPromoter ? "PROMOTER" : "BUSINESS",
      submitted_at: vr.submittedAt,
      requester_headline: isPromoter ? vr.promoterProfile?.headline ?? null : null,
      admin_notes: vr.adminNotes ?? null,
      reviewed_at: vr.reviewedAt ?? null,
      documentUrl: vr.documentUrl ?? null,
      documentName: vr.documentName ?? null,
      document_url: vr.documentUrl ?? null,
      document_name: vr.documentName ?? null,
      profile_data: isPromoter
        ? {
            niche: vr.promoterProfile?.niche ?? null,
            followers_count: vr.promoterProfile?.followersCount ?? null,
            engagement_rate: vr.promoterProfile?.engagementRate ?? null,
            location: vr.promoterProfile?.location ?? null,
          }
        : {
            website: vr.businessProfile?.website ?? null,
            company_size: vr.businessProfile?.companySize ?? null,
            location: vr.businessProfile?.location ?? null,
          },
    };
  });
  return ok(
    res,
    { items: mapped, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(Number(total) / Number(limit))) },
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
