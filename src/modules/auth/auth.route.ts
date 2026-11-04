import { Router } from "express";
import { authController } from "./auth.controller.js";
import { userController } from "../user/user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

// Register new user (Customer or Provider)
router.post("/register", userController.registerUser);

// Login user and return JWT
router.post("/login", authController.loginUser);

// Refresh access token
router.get("/refresh-token", authController.refreshToken);

// Get current authenticated user
router.get("/me", auth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER), userController.getMyProfile);

export const authRoutes = router;
