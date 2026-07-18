import * as completionService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";
import { authenticate } from "../../shared/auth.js";

export const getCompletion = wrap(async (req, res) => {
  const data = await completionService.getCompletion(req.user);
  return ok(res, data, "Profile completion");
});
