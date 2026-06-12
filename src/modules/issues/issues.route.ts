import { Router } from "express";
import { issuesController } from "./issues.controller";

const router = Router();

// issue post api
router.post("/",issuesController.createIssues);

export const issuesRoute = router;