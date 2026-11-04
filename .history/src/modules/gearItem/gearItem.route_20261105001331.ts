import { Router } from "express";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post("/", auth)

export const gearItemsRoutes = router;
