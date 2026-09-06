import path from "path";
import * as uploadService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";
import { AppError } from "../../shared/errors.js";

function handle(subfolder) {
  return wrap(async (req, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    const url = uploadService.saveUpload(req.file, subfolder);
    return ok(res, { url }, "File uploaded", 201);
  });
}

export const uploadAvatar = handle("avatars");
export const uploadLogo = handle("logos");
export const uploadPortfolioImage = handle("portfolio");
export const uploadChatAttachment = handle("chat");
export const uploadDocument = wrap(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const ext = path.extname(req.file.originalname || "").toLowerCase();
  if (ext !== ".pdf") {
    throw new AppError("Only PDF documents are allowed", 400);
  }
  const url = uploadService.saveUpload(req.file, "documents");
  return ok(res, { url }, "File uploaded", 201);
});

