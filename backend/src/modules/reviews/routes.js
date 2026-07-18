import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { reviewCreateSchema, reviewUpdateSchema, reviewListQuerySchema } from "./validation.js";

const router = express.Router();
router.use(authenticate);

// Collaboration completion + reviews (any participant)
router.post("/collaborations/:collaborationId/complete", controllers.complete);
router.post("/collaborations/:collaborationId/reviews", validate(reviewCreateSchema), controllers.create);

router.put("/reviews/:reviewId", validate(reviewUpdateSchema), controllers.update);
router.delete("/reviews/:reviewId", controllers.remove);

router.get("/my/reviews", validate(reviewListQuerySchema, "query"), controllers.myReviews);
router.get("/my/received-reviews", validate(reviewListQuerySchema, "query"), controllers.myReceivedReviews);
router.get("/users/:userId/reviews", validate(reviewListQuerySchema, "query"), controllers.userReviews);
router.get("/users/:userId/rating", controllers.userRating);

export default router;
