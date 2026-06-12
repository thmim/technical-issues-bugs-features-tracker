import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";

const app: Application = express();
app.use(express.json());



app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "choltece",
        author: "ami"
    })
})

// register api
app.use("/api/auth/signup",userRoute);

// login api
app.use("/api/auth",userRoute);

// create issues api
app.use("/api/issues",issuesRoute);



export default app;