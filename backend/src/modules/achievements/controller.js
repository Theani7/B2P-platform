import * as achievementService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const list = wrap(async (req, res) => {
  const data = await achievementService.getAllAchievements(true);
  return ok(res, data, "Achievements");
});

export const myAchievements = wrap(async (req, res) => {
  const data = await achievementService.getUserAchievementsWithLevel(req.user.id);
  return ok(res, data, "My achievements");
});

export const userAchievements = wrap(async (req, res) => {
  const data = await achievementService.getUserAchievementsWithLevel(req.params.userId);
  return ok(res, data, "User achievements");
});

export const recalculate = wrap(async (req, res) => {
  const count = await achievementService.recalculateAll();
  return ok(res, { success: true, count }, `Recalculated achievements for ${count} users.`);
});
