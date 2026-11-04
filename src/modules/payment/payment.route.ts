import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

// Create Stripe Checkout Session for a rental order
router.post("/create", auth(Role.CUSTOMER, Role.ADMIN), paymentController.createPaymentSession);

// Confirm / verify payment after Stripe redirect (supports both GET redirect and POST)
router.get("/confirm", paymentController.confirmPayment);
router.post("/confirm", paymentController.confirmPayment);

// Cancel callback endpoint
router.get("/cancel", paymentController.cancelPaymentCallback);

// Get authenticated user's payment history
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getMyPaymentHistory);

// Get single payment details by ID
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;

