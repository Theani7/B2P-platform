import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { AppError } from "../../shared/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_BASE = path.resolve(__dirname, "../../../uploads");

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx", ".txt"]);

function urlFor(subfolder, filename) {
  switch (subfolder) {
    case "avatars":
      return `/uploads/avatars/${filename}`;
    case "logos":
      return `/uploads/logos/${filename}`;
    case "portfolio":
      return `/uploads/portfolio/${filename}`;
    case "chat":
      return `/uploads/chat/${filename}`;
    default:
      return `/uploads/${subfolder}/${filename}`;
  }
}

export function uploadBaseDir() {
  return UPLOAD_BASE;
}

export function saveUpload(file, subfolder) {
  if (!file || !file.buffer) throw new AppError("No file provided", 400);
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED.has(ext)) {
    throw new AppError(`File type ${ext || "unknown"} not allowed`, 400);
  }
  const folder = path.join(UPLOAD_BASE, subfolder);
  fs.mkdirSync(folder, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(folder, filename), file.buffer);
  return urlFor(subfolder, filename);
}
