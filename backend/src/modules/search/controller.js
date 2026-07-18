import * as searchService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const search = wrap(async (req, res) => {
  const data = await searchService.performSearch(req.user, req.query);
  return ok(res, data, "Search results");
});

export const history = wrap(async (req, res) => {
  const data = await searchService.getHistory(req.user);
  return ok(res, data, "Search history");
});

export const clear = wrap(async (req, res) => {
  const data = await searchService.clearHistory(req.user);
  return ok(res, data, "Search history cleared");
});
