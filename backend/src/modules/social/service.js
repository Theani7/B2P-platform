import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";

const PROFILE_URL = {
  INSTAGRAM: (u) => `https://instagram.com/${u}`,
  TIKTOK: (u) => `https://tiktok.com/@${u}`,
  YOUTUBE: (u) => `https://youtube.com/@${u}`,
  FACEBOOK: (u) => `https://facebook.com/${u}`,
  X: (u) => `https://x.com/${u}`,
  LINKEDIN: (u) => `https://linkedin.com/in/${u}`,
};

/** Normalize a handle: trim, drop leading @, and extract the handle if a full URL was pasted. */
export function cleanUsername(raw) {
  if (!raw) return "";
  let u = String(raw).trim().replace(/^@+/, "");
  if (u.includes("/")) {
    u = u.split("?")[0].split("/").filter(Boolean).pop() || "";
    u = u.replace(/^@+/, "");
  }
  return u;
}

function buildUrl(platform, username) {
  const build = PROFILE_URL[platform];
  if (!build || !username) return null;
  return build(username);
}

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
  const platform = payload.platform;
  const username = cleanUsername(payload.username);
  const url = payload.url || buildUrl(platform, username);
  if (!url) throw new AppError("Provide a username or a URL", 400);
  return prisma.socialLink.create({
    data: { userId: user.id, ...payload, platform, username: username || null, url },
  });
}

export async function update(user, id, payload) {
  const link = await get(user, id);
  const data = { ...payload };
  if (data.username !== undefined) data.username = cleanUsername(data.username) || null;
  // Rebuild the URL when the handle/platform changes unless an explicit URL was sent.
  if ((data.username !== undefined || data.platform) && data.url === undefined) {
    const rebuilt = buildUrl(data.platform || link.platform, data.username !== undefined ? data.username : link.username);
    if (rebuilt) data.url = rebuilt;
  }
  return prisma.socialLink.update({ where: { id: link.id }, data });
}

export async function remove(user, id) {
  const link = await get(user, id);
  await prisma.socialLink.delete({ where: { id: link.id } });
  return { success: true, message: "Social link deleted" };
}
