import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { gearItemsController } from "./gearItem.controller.js";

const router = Router();

router.post("/", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.createGearItem)
router.get("/",  gearItemsController.getGearByGearI)
router.post("/", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.createGearItem)

export const gearItemsRoutes = router;
