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


export const userRoutes = router;
