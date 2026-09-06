import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

async function resolvePromoter(user) {
  if (user.role !== ROLE.PROMOTER) {
    throw new AppError("Only PROMOTER users can manage portfolio media", 403);
  }
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Promoter profile not found", 404);
  return profile;
}

async function ensureItemOwnership(profileId, itemId) {
  const item = await prisma.portfolioItem.findFirst({
    where: { id: itemId, promoterId: profileId },
  });
  if (!item) throw new AppError("Portfolio item not found", 404);
  return item;
}

export async function listMedia(user, itemId) {
  const profile = await resolvePromoter(user);
  await ensureItemOwnership(profile.id, itemId);
  return prisma.portfolioMedia.findMany({
    where: { portfolioItemId: itemId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function addMedia(user, itemId, filePath, mediaType = "IMAGE") {
  const profile = await resolvePromoter(user);
  await ensureItemOwnership(profile.id, itemId);

  const count = await prisma.portfolioMedia.count({ where: { portfolioItemId: itemId } });
  if (count >= 5) {
    throw new AppError("Maximum 5 images allowed per portfolio item", 400);
  }

  const maxOrder = await prisma.portfolioMedia.findFirst({
    where: { portfolioItemId: itemId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  return prisma.portfolioMedia.create({
    data: {
      portfolioItemId: itemId,
      filePath,
      mediaType,
      displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
    },
  });
}

export async function removeMedia(user, itemId, mediaId) {
  const profile = await resolvePromoter(user);
  await ensureItemOwnership(profile.id, itemId);
  const media = await prisma.portfolioMedia.findFirst({
    where: { id: mediaId, portfolioItemId: itemId },
  });
  if (!media) throw new AppError("Media not found", 404);
  await prisma.portfolioMedia.delete({ where: { id: mediaId } });
  return { success: true };
}
