import { Router } from "express";
import { userController } from "./auth.controller";


const router = Router();
router.post("/",userController.createUser);
router.post("/login",userController.loginUser);
// router.post("/");

export const userRoute = router;