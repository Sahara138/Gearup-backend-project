import express, { Application } from "express";
import cors from 
const app : Application = express();

//middleware start
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));

export default app;