import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";

export async function list(user) {
  return prisma.socialLink.findMany({
    where: { userId: user.id },
    orderBy: { displayOrder: "asc" },
  });
}

export async function get(user, id) {
  const link = await prisma.socialLink.findFirst({ where: { id, userId: user.id } });
  if (!link) throw new AppError("Social link not found", 404);
  return link;
}

export async function create(user, payload) {
  return prisma.socialLink.create({ data: { userId: user.id, ...payload } });
}

export async function update(user, id, payload) {
  const link = await get(user, id);
  return prisma.socialLink.update({ where: { id: link.id }, data: payload });
}

export async function remove(user, id) {
  const link = await get(user, id);
  await prisma.socialLink.delete({ where: { id: link.id } });
  return { success: true, message: "Social link deleted" };
}
