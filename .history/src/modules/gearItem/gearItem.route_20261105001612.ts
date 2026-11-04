import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { gearItemsController } from "./gearItem.controller.js";

const router = Router();

router.post("/", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.createGearItem)
router.get("/:gearItemId",  gearItemsController.getGearByGearItemId)
router.get("/", auth(Role.ADMIN, Role.PROVIDER,Role), gearItemsController.createGearItem)

export const gearItemsRoutes = router;
