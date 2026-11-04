import express, { Application, Request, Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { userRoutes } from "./modules/user/user.route.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { gearItemsRoutes } from "./modules/gearItem/gearItem.route.js";

const app : Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req:Request, res:Response) => {
    res.send("Hello World");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gear", gearItemsRoutes);
app.use("/api/provider/gear", gearItemsRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
