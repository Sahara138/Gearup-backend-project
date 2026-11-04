import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";

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

export const userRoutes = router;
