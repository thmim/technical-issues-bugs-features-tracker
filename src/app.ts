import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/auth/auth.route";

const app: Application = express();
app.use(express.json());



app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "choltece",
        author: "ami"
    })
})


app.use("/api/auth/signup",userRoute)



export default app;