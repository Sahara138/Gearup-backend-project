import { Router } from "express";

const router = Router();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: Role
                ;
            };
        }
    }
}

export const userRoutes = router;
