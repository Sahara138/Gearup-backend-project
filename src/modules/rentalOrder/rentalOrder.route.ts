import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { rentalOrderController } from "./rentalOrder.controller.js";

const rentalRouter = Router();

// Customer creates rental order
rentalRouter.post("/", auth(Role.CUSTOMER), rentalOrderController.createRentalOrder);

// Customer gets own rental orders
rentalRouter.get("/", auth(Role.CUSTOMER, Role.ADMIN), rentalOrderController.getMyRentalOrders);

// Provider incoming orders & Admin all orders (placed before :id)
rentalRouter.get("/provider/incoming", auth(Role.PROVIDER, Role.ADMIN), rentalOrderController.getProviderIncomingOrders);
rentalRouter.get("/admin/all", auth(Role.ADMIN), rentalOrderController.getAllRentalOrdersForAdmin);

// Customer cancels placed order
rentalRouter.patch("/:id/cancel", auth(Role.CUSTOMER), rentalOrderController.cancelRentalOrder);

// Provider or Admin updates status (confirm, picked up, returned)
rentalRouter.patch("/:id/status", auth(Role.PROVIDER, Role.ADMIN), rentalOrderController.updateRentalOrderStatus);

// Get single order details
rentalRouter.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), rentalOrderController.getRentalOrderById);

// Provider management dedicated router (/api/provider/orders)
const providerOrderRouter = Router();
providerOrderRouter.get("/", auth(Role.PROVIDER, Role.ADMIN), rentalOrderController.getProviderIncomingOrders);
providerOrderRouter.patch("/:id", auth(Role.PROVIDER, Role.ADMIN), rentalOrderController.updateRentalOrderStatus);

// Admin dedicated rentals router (/api/admin/rentals)
const adminRentalRouter = Router();
adminRentalRouter.get("/", auth(Role.ADMIN), rentalOrderController.getAllRentalOrdersForAdmin);

export const rentalOrderRoutes = rentalRouter;
export const providerOrderRoutes = providerOrderRouter;
export const adminRentalRoutes = adminRentalRouter;

