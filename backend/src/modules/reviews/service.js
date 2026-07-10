import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { createNotification } from "../../shared/notify.js";

function reviewerInfo(user) {
  const avatar = user?.promoterProfile?.avatarUrl || user?.businessProfile?.logoUrl || null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: avatar,
  };
}

function toReviewRead(r) {
  const business = r.collaboration?.businessProfile || null;
  const campaign = r.collaboration?.campaign || null;
  return {
    id: r.id,
    collaborationId: r.collaborationId,
    reviewer: r.reviewer ? reviewerInfo(r.reviewer) : null,
    revieweeId: r.revieweeId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    businessName: business?.companyName ?? "",
    campaignTitle: campaign?.title ?? "",
  };
}

const reviewerInclude = {
  reviewer: { include: { promoterProfile: true, businessProfile: true } },
  collaboration: { include: { campaign: true, businessProfile: true } },
};

export async function completeCollaboration(user, collaborationId) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { campaign: true, businessProfile: true, promoterProfile: true },
  });
  if (!collab) throw new AppError("Collaboration not found", 404);
  if (collab.status !== "ACTIVE") {
    throw new AppError("Only active collaborations can be completed", 400);
  }

  const profileIds = new Set(
    [user.businessProfile?.id, user.promoterProfile?.id].filter(Boolean)
  );
  if (!profileIds.has(collab.businessProfileId) && !profileIds.has(collab.promoterProfileId)) {
    throw new AppError("You are not a participant in this collaboration", 403);
  }

  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  const otherPartyId = user.businessProfile
    ? collab.promoterProfile.userId
    : collab.businessProfile.userId;
  await createNotification({
    recipientId: otherPartyId,
    actorId: user.id,
    type: "COLLABORATION_COMPLETED",
    title: "Collaboration completed",
    message: `${user.username} completed the collaboration on '${collab.campaign?.title ?? ""}'`,
    entityType: "collaboration",
    entityId: collab.id,
  });

  return updated;
}

export async function createReview(user, collaborationId, payload) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { businessProfile: true, promoterProfile: true },
  });
  if (!collab) throw new AppError("Collaboration not found", 404);
  if (collab.status !== "COMPLETED") {
    throw new AppError("Can only review completed collaborations", 400);
  }

  const isBusiness = user.businessProfile?.id === collab.businessProfileId;
  const isPromoter = user.promoterProfile?.id === collab.promoterProfileId;
  if (!isBusiness && !isPromoter) {
    throw new AppError("You are not a participant in this collaboration", 403);
  }

  const existing = await prisma.review.findFirst({
    where: { collaborationId: collab.id, reviewerId: user.id },
  });
  if (existing) throw new AppError("You have already reviewed this collaboration", 409);

  const revieweeId = isBusiness ? collab.promoterProfile.userId : collab.businessProfile.userId;

  const review = await prisma.review.create({
    data: {
      collaborationId: collab.id,
      reviewerId: user.id,
      revieweeId,
      rating: payload.rating,
      comment: payload.comment ?? null,
    },
  });

  await createNotification({
    recipientId: revieweeId,
    actorId: user.id,
    type: "REVIEW_RECEIVED",
    title: "New review received",
    message: `You received a ${payload.rating}-star review from ${user.username}`,
    entityType: "review",
    entityId: review.id,
  });

  return review;
}

export async function updateReview(user, reviewId, payload) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError("Review not found", 404);
  if (review.reviewerId !== user.id) throw new AppError("You can only edit your own reviews", 403);

  const data = {};
  if (payload.rating !== undefined) data.rating = payload.rating;
  if (payload.comment !== undefined) data.comment = payload.comment;

  return prisma.review.update({ where: { id: reviewId }, data });
}

export async function deleteReview(user, reviewId) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError("Review not found", 404);
  if (review.reviewerId !== user.id) throw new AppError("You can only delete your own reviews", 403);

  await prisma.review.delete({ where: { id: reviewId } });
}

export async function getMyReviews(user, params = {}) {
  const { page = 1, limit = 20 } = params;
  const where = { reviewerId: user.id };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewerInclude,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.review.count({ where }),
  ]);
  return [rows.map(toReviewRead), total];
}

export async function getReceivedReviews(userId, params = {}) {
  const { page = 1, limit = 20 } = params;
  const where = { revieweeId: userId };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewerInclude,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.review.count({ where }),
  ]);
  return [rows.map(toReviewRead), total];
}

export async function getUserReviews(userId, params = {}) {
  const { page = 1, limit = 20 } = params;
  const where = { revieweeId: userId };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { reviewer: { include: { promoterProfile: true, businessProfile: true } } },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.review.count({ where }),
  ]);
  return [rows.map(toReviewRead), total];
}

export async function getRatingSummary(userId) {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    select: { rating: true },
  });
  const total = reviews.length;
  const distribution = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
  if (total === 0) {
    return { averageRating: 0, totalReviews: 0, distribution };
  }
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    distribution[`star${r.rating}`] = (distribution[`star${r.rating}`] ?? 0) + 1;
  }
  return {
    averageRating: Math.round((sum / total) * 10) / 10,
    totalReviews: total,
    distribution,
  };
}
