import express, { Application, Request, Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app : Application = express();

//middleware start
// app.use(cors({
//     origin: config.app_url,
//     credentials: true,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//middleware end

app.get("/", async (req:Request, res:Response) => {
    // const user = await prisma.user.findMany();
    // console.log(user)
    res.send("Hello World");
});

// app.use("/api/users", userRoutes)
// app.use("/api/auth", authRoutes)
// app.use("/api/posts", postRoutes)
// app.use("/api/comments", commentRoutes)
// app.use("/api/subscription", subscriptionRoutes)
// app.use("/api/premium", premiumRoutes)

// app.use((req: Request, res: Response)=> {
//     res.status(404).json({
//         message : "Route not found",
//         path : req.originalUrl,
//         date: Date()
//     })
// })

app.use(notFound)
app.use(globalErrorHandler)

export default app;