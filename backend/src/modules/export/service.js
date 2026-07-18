import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../../config/db.js";
import { ROLE } from "../../shared/enums.js";
import { uploadBaseDir } from "../upload/service.js";

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

async function gather(user, module) {
  if (module === "campaigns") {
    const where =
      user.role === ROLE.BUSINESS && user.businessProfile
        ? { businessProfileId: user.businessProfile.id }
        : user.role === ROLE.PROMOTER
        ? { status: "ACTIVE" }
        : {};
    const camps = await prisma.campaign.findMany({
      where,
      include: { businessProfile: true },
    });
    return camps.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      budget: Number(c.budget),
      location: c.location,
      category: c.category,
      business: c.businessProfile?.companyName || "",
    }));
  }

  if (module === "promoters") {
    const proms = await prisma.promoterProfile.findMany({});
    return proms.map((p) => ({
      id: p.id,
      username: p.username,
      niche: p.niche,
      followersCount: p.followersCount,
      location: p.location,
      verified: p.verified,
    }));
  }

  if (module === "profile") {
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      include: { promoterProfile: true, businessProfile: true },
    });
    return [
      {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        promoterUsername: u.promoterProfile?.username || "",
        promoterNiche: u.promoterProfile?.niche || "",
        businessCompany: u.businessProfile?.companyName || "",
      },
    ];
  }

  return [];
}

export async function exportData(user, { module, format, columns }) {
  const rows = await gather(user, module);

  let dataRows = rows;
  if (columns && columns.length && rows.length) {
    dataRows = rows.map((r) => {
      const o = {};
      for (const c of columns) if (c in r) o[c] = r[c];
      return o;
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${module}_${timestamp}_${crypto.randomUUID().slice(0, 6)}.${format}`;
  const dir = path.join(uploadBaseDir(), "exports");
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename);

  const content = format === "json" ? JSON.stringify(dataRows, null, 2) : toCsv(dataRows);
  fs.writeFileSync(filepath, content);

  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  return {
    downloadUrl: `/uploads/exports/${filename}`,
    expiresAt,
    filename,
  };
}
