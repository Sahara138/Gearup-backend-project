import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { userController } from "./user.controller.js";

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

router.post("/register", userController.registerUser);
router.put("/my-profile", auth(Role.ADMIN,Role.AUTHOR,Role.USER), userController.updateMyProfile)


export const userRoutes = router;
