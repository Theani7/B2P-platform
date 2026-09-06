import * as exportService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const exportData = wrap(async (req, res) => {
  const data = await exportService.exportData(req.user, req.body);
  return ok(res, data, "Export ready", 201);
});
