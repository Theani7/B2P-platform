import * as mediaService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const listMedia = wrap(async (req, res) => {
  const data = await mediaService.listMedia(req.user, req.params.id);
  return ok(res, data, "Portfolio media");
});

export const addMedia = wrap(async (req, res) => {
  const { filePath } = req.body;
  const data = await mediaService.addMedia(req.user, req.params.id, filePath);
  return ok(res, data, "Media added", 201);
});

export const removeMedia = wrap(async (req, res) => {
  const result = await mediaService.removeMedia(req.user, req.params.id, req.params.mediaId);
  return ok(res, result, "Media removed");
});
