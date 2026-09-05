import express from "express";
import * as controllers from "./controller.js";
import { authenticate } from "../../shared/auth.js";
import { validate } from "../../shared/validate.js";
import { reviewCreateSchema, reviewUpdateSchema, reviewListQuerySchema } from "./validation.js";

const router = express.Router();

// Collaboration completion + reviews (any participant)
router.post("/collaborations/:collaborationId/complete", authenticate, controllers.complete);
router.post("/collaborations/:collaborationId/reviews", authenticate, validate(reviewCreateSchema), controllers.create);

router.put("/reviews/:reviewId", authenticate, validate(reviewUpdateSchema), controllers.update);
router.delete("/reviews/:reviewId", authenticate, controllers.remove);

router.get("/my/reviews", authenticate, validate(reviewListQuerySchema, "query"), controllers.myReviews);
router.get("/my/received-reviews", authenticate, validate(reviewListQuerySchema, "query"), controllers.myReceivedReviews);
router.get("/users/:userId/reviews", authenticate, validate(reviewListQuerySchema, "query"), controllers.userReviews);
router.get("/users/:userId/rating", authenticate, controllers.userRating);

export default router;
