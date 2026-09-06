import express from "express";
import { getCompletion } from "./controller.js";
import { authenticate } from "../../shared/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getCompletion);

export default router;
