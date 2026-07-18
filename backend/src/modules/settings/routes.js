import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";

// Public platform settings (no auth) — used for frontend dropdowns.
export const publicRouter = express.Router();
publicRouter.get("/", controllers.publicSettings);

// Account settings (authenticated) — profile + notification preferences.
export const accountRouter = express.Router();
accountRouter.use(authenticate);
accountRouter.get("/account", controllers.account);

export default publicRouter;
