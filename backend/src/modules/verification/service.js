import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

async function auditLog(userId, action, entityId, req) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType: "verification_request",
        entityId: entityId ? String(entityId) : null,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.["user-agent"]?.slice(0, 500) || null,
      },
    });
  } catch {
    // Audit logging must never block the primary operation.
  }
}

async function businessProfileOf(user) {
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Business profile not found", 404);
  return profile;
}

async function promoterProfileOf(user) {
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Promoter profile not found", 404);
  return profile;
}

async function submit({ profileId, key, alreadyVerified, req, userId }) {
  if (alreadyVerified) throw new AppError("Profile is already verified", 400);

  const existingPending = await prisma.verificationRequest.findFirst({
    where: { [key]: profileId, status: "PENDING" },
  });
  if (existingPending) throw new AppError("A verification request is already pending", 400);

  const vr = await prisma.verificationRequest.create({
    data: { [key]: profileId, status: "PENDING" },
  });
  await auditLog(userId, "VERIFICATION_SUBMITTED", vr.id, req);
  return vr;
}

export async function submitBusiness(user, req) {
  const profile = await businessProfileOf(user);
  return submit({
    profileId: profile.id,
    key: "businessProfileId",
    alreadyVerified: profile.verified,
    req,
    userId: user.id,
  });
}

export async function submitPromoter(user, req) {
  const profile = await promoterProfileOf(user);
  return submit({
    profileId: profile.id,
    key: "promoterProfileId",
    alreadyVerified: profile.verified,
    req,
    userId: user.id,
  });
}

export async function getMyBusinessRequests(user) {
  const profile = await businessProfileOf(user);
  return prisma.verificationRequest.findMany({
    where: { businessProfileId: profile.id },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getMyPromoterRequests(user) {
  const profile = await promoterProfileOf(user);
  return prisma.verificationRequest.findMany({
    where: { promoterProfileId: profile.id },
    orderBy: { submittedAt: "desc" },
  });
}

export async function listRequests(params = {}) {
  const { status, page = 1, limit = 20 } = params;
  const where = {};
  if (status) where.status = status;

  const total = await prisma.verificationRequest.count({ where });
  const items = await prisma.verificationRequest.findMany({
    where,
    include: {
      promoterProfile: { select: { id: true, username: true } },
      businessProfile: { select: { id: true, companyName: true } },
    },
    orderBy: { submittedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

async function loadPending(id) {
  const vr = await prisma.verificationRequest.findUnique({ where: { id } });
  if (!vr) throw new AppError("Verification request not found", 404);
  if (vr.status !== "PENDING") throw new AppError("Request already processed", 400);
  return vr;
}

export async function approve(admin, id, adminNotes, req) {
  const vr = await loadPending(id);

  const [updated] = await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id: vr.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        adminNotes: adminNotes || null,
      },
    }),
    ...(vr.promoterProfileId
      ? [prisma.promoterProfile.update({ where: { id: vr.promoterProfileId }, data: { verified: true } })]
      : []),
    ...(vr.businessProfileId
      ? [prisma.businessProfile.update({ where: { id: vr.businessProfileId }, data: { verified: true } })]
      : []),
  ]);

  await auditLog(admin.id, "VERIFICATION_APPROVED", vr.id, req);
  return updated;
}

export async function reject(admin, id, adminNotes, req) {
  const vr = await loadPending(id);
  const updated = await prisma.verificationRequest.update({
    where: { id: vr.id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      adminNotes: adminNotes || null,
    },
  });
  await auditLog(admin.id, "VERIFICATION_REJECTED", vr.id, req);
  return updated;
}
