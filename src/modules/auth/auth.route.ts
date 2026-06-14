import { Router } from "express";
import { userController } from "./auth.controller";


const router = Router();

// register route
router.post("/",userController.createUser);

// login route
router.post("/login",userController.loginUser);


export const userRoute = router;