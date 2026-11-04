import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { gearItemsController } from "./gearItem.controller.js";

const router = Router();

router.post("/", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.createGearItem)
router.get("/:gearItemId",  gearItemsController.getGearByGearItemId)
router.get("/", auth(Role.ADMIN, Role.PROVIDER,Role.CUSTOMER), gearItemsController.getAllGearItems)
router.patch("/:gearItemId", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.updateGearItems)
router.delete("/:gearItemId", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.getAllGearItems)

export const gearItemsRoutes = router;
