import * as uploadService from "./service.js";
import { ok } from "../../shared/response.js";
import { AppError } from "../../shared/errors.js";

function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

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
