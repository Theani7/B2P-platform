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

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

const app = createApp();
const port = config.port;

const server = http.createServer(app);
const io = initSocket(server);
registerChatSocket(io);

server.listen(port, () => {
  console.log(`Byparsathy backend (Express + socket.io) listening on :${port}`);
});

seedAdmin().catch((e) => console.error("Admin seed failed", e));
seedSettings().catch((e) => console.error("Settings seed failed", e));

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => {
    io.close();
    prisma.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { app, server, prisma, io };
