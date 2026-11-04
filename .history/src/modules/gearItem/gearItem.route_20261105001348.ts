import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post("/", auth(Role.ADMIN, Role.PR))

export const gearItemsRoutes = router;
