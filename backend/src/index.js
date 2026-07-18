import dotenv from "dotenv";
dotenv.config();

import http from "http";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { prisma } from "./config/db.js";
import { config } from "./config/env.js";
import { initSocket } from "./shared/socket.js";
import { registerChatSocket } from "./modules/chat/socket.js";
import { seedSettings } from "./modules/admin/service.js";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && (!process.env.ADMIN_PASSWORD || password === "admin123")) {
    console.warn("Skipping admin seed: set a strong ADMIN_PASSWORD (and ADMIN_EMAIL) in production.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username: "admin",
        fullName: "Platform Admin",
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
        isVerified: true,
      },
    });
    console.log(`Seeded default admin user (${email})`);
  }
}

const ACHIEVEMENT_DEFS = [
  { key: "COMPLETE_PROFILE", title: "Profile Complete", description: "Create your promoter profile.", category: "profile", points: 10 },
  { key: "COMPLETE_BUSINESS_PROFILE", title: "Business Ready", description: "Create your business profile.", category: "profile", points: 10 },
  { key: "FIRST_SOCIAL_LINK", title: "Connected", description: "Add your first social link.", category: "engagement", points: 5 },
  { key: "FIRST_PORTFOLIO", title: "Showcase Started", description: "Add your first portfolio item.", category: "portfolio", points: 5 },
];

async function seedAchievements() {
  for (const def of ACHIEVEMENT_DEFS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      update: {},
      create: { ...def, isActive: true },
    });
  }
}

const app = createApp();
const port = config.port;

const server = http.createServer(app);
const io = initSocket(server);
registerChatSocket(io);

server.listen(port, () => {
  console.log(`Byparsathy backend (Express + socket.io) listening on :${port}`);
});

seedAdmin().catch((e) => console.error("Admin seed failed", e));
seedAchievements().catch((e) => console.error("Achievement seed failed", e));
seedSettings().catch((e) => console.error("Settings seed failed", e));

export { app, server, prisma, io };
