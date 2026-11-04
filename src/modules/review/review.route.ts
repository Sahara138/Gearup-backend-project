import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { reviewController } from "./review.controller.js";

const router = Router();

// Create review (after rental return)
router.post("/", auth(Role.CUSTOMER), reviewController.createReview);

// Get authenticated user's reviews
router.get("/my-reviews", auth(Role.CUSTOMER, Role.ADMIN), reviewController.getMyReviews);

// Get reviews for a specific gear item (public)
router.get("/gear/:gearItemId", reviewController.getGearReviews);

// Update review
router.patch("/:reviewId", auth(Role.CUSTOMER), reviewController.updateReview);

// Delete review (Customer owner or Admin)
router.delete("/:reviewId", auth(Role.CUSTOMER, Role.ADMIN), reviewController.deleteReview);

export const reviewRoutes = router;

