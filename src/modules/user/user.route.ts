import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { userController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: Role;
            };
        }
    }
}

// User registration & profile
router.post("/register", userController.registerUser);
router.get("/me", auth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER), userController.getMyProfile);
router.put("/my-profile", auth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER), userController.updateMyProfile);

// Dedicated Admin User Management Router (/api/admin/users)
const adminUserRouter = Router();
adminUserRouter.get("/", auth(Role.ADMIN), userController.getAllUsers);
adminUserRouter.patch("/:id", auth(Role.ADMIN), userController.updateUserStatus);

export const userRoutes = router;
export const adminUserRoutes = adminUserRouter;
