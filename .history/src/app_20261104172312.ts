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
    const user = await prisma.user.findMany();
    console.log(user)
    res.send("Hello World");
});

export default app;