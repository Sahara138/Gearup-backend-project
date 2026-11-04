import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { gearItemsController } from "./gearItem.controller.js";

const router = Router();

// Provider inventory endpoint (must come before /:gearItemId)
router.get("/my-gear", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.getMyGearItems);

// Public gear listings with search, filter, pagination
router.get("/", gearItemsController.getAllGearItems);

// Public gear details with specs, provider, reviews
router.get("/:gearItemId", gearItemsController.getGearByGearItemId);

// Add gear to inventory (Admin or Provider)
router.post("/", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.createGearItem);

// Update gear listing (Admin or owning Provider)
router.patch("/:gearItemId", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.updateGearItems);
router.put("/:gearItemId", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.updateGearItems);

// Remove gear from inventory (Admin or owning Provider)
router.delete("/:gearItemId", auth(Role.ADMIN, Role.PROVIDER), gearItemsController.deleteGearItems);

// Admin dedicated gear router (/api/admin/gear)
const adminGearRouter = Router();
adminGearRouter.get("/", auth(Role.ADMIN), gearItemsController.getAllGearItems);

export const gearItemsRoutes = router;
export const adminGearRoutes = adminGearRouter;
