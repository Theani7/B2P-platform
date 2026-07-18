import * as invitationsService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

function paginated(res, items, total, page, limit, message) {
  return ok(
    res,
    { items, total, page: Number(page), limit: Number(limit), pages: Math.max(1, Math.ceil(total / Number(limit))) },
    message
  );
}

// --- Business ---
export const invite = wrap(async (req, res) => {
  const inv = await invitationsService.invite(req.user, req.params.id, req.params.promoterId, req.body || {});
  return ok(res, { id: inv.id, status: inv.status }, "Invitation sent", 201);
});

export const cancel = wrap(async (req, res) => {
  await invitationsService.cancel(req.user, req.params.id);
  return ok(res, null, "Invitation cancelled");
});

export const businessInvitations = wrap(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const [items, total] = await invitationsService.getBusinessInvitations(req.user, { status, page: Number(page), limit: Number(limit) });
  return paginated(res, items, total, page, limit, "Invitations");
});

// --- Promoter ---
export const promoterInvitations = wrap(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const [items, total] = await invitationsService.getPromoterInvitations(req.user, { status, page: Number(page), limit: Number(limit) });
  return paginated(res, items, total, page, limit, "Invitations");
});

export const accept = wrap(async (req, res) => {
  const collab = await invitationsService.accept(req.user, req.params.id);
  return ok(res, { id: collab.id, status: collab.status }, "Invitation accepted", 201);
});

export const reject = wrap(async (req, res) => {
  await invitationsService.reject(req.user, req.params.id);
  return ok(res, null, "Invitation rejected");
});
