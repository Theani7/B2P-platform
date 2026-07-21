import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

async function resolvePromoter(user) {
  if (user.role !== ROLE.PROMOTER) {
    throw new AppError("Only PROMOTER users can manage portfolio items", 403);
  }
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Promoter profile not found", 404);
  return profile;
}

export async function list(user) {
  const profile = await resolvePromoter(user);
  return prisma.portfolioItem.findMany({
    where: { promoterId: profile.id },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { media: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function get(user, id) {
  const profile = await resolvePromoter(user);
  const item = await prisma.portfolioItem.findFirst({
    where: { id, promoterId: profile.id },
    include: { media: { orderBy: { displayOrder: "asc" } } },
  });
  if (!item) throw new AppError("Portfolio item not found", 404);
  return item;
}

export async function create(user, payload) {
  const profile = await resolvePromoter(user);
  return prisma.portfolioItem.create({
    data: { promoterId: profile.id, ...payload },
  });
}

export async function update(user, id, payload) {
  const item = await get(user, id);
  return prisma.portfolioItem.update({ where: { id: item.id }, data: payload });
}

export async function remove(user, id) {
  const item = await get(user, id);
  await prisma.portfolioItem.delete({ where: { id: item.id } });
  return { success: true, message: "Portfolio item deleted" };
}
