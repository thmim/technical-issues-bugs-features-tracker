import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors"
import globalErrorHandler from "./middleware/globalerror";
const app: Application = express();
app.use(express.json());
var corsOptions = {
  origin: 'http://localhost:3000'
}
app.use(cors(corsOptions));

// root api
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "server running",
        author: "ami"
    })
})

// register api
app.use("/api/auth/signup",userRoute);

// login api
app.use("/api/auth",userRoute);

// create issues api
app.use("/api/issues",issuesRoute);
// get all issues api
app.use("/api/issues",issuesRoute);
// get single issue api
app.use("/api/issues",issuesRoute);
// update issue api
app.use("/api/issues",issuesRoute);
// issue delete api
app.use("/api/issues",issuesRoute);

// global error handler
app.use(globalErrorHandler);

export default app;