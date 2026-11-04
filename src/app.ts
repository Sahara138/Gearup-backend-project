import express, { Application, Request, Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { notFound } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { userRoutes, adminUserRoutes } from "./modules/user/user.route.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { gearItemsRoutes, adminGearRoutes } from "./modules/gearItem/gearItem.route.js";
import { categoryRoutes } from "./modules/category/category.route.js";
import {
    rentalOrderRoutes,
    providerOrderRoutes,
    adminRentalRoutes
} from "./modules/rentalOrder/rentalOrder.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { paymentRoutes } from "./modules/payment/payment.route.js";
import { swaggerSpec } from "./docs/swagger.js";

const app : Application = express();

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Interactive Swagger UI documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", async (req: Request, res: Response) => {
    res.send({
        success: true,
        message: "Welcome to GearUp API",
        version: "1.0.0",
        documentation: "/api/docs"
    });
});

// Auth & Users
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Gear
app.use("/api/gear", gearItemsRoutes);
app.use("/api/categories", categoryRoutes);

// Rentals
app.use("/api/rentals", rentalOrderRoutes);

// Payments (Stripe)
app.use("/api/payments", paymentRoutes);

// Reviews
app.use("/api/reviews", reviewRoutes);

// Provider Dedicated Routes
app.use("/api/provider/gear", gearItemsRoutes);
app.use("/api/provider/orders", providerOrderRoutes);

// Admin Dedicated Routes
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/gear", adminGearRoutes);
app.use("/api/admin/rentals", adminRentalRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
