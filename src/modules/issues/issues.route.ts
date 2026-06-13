import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth.middleware";

const router = Router();

// issue post api
router.post("/", auth() , issuesController.createIssues);
// all issues get api
router.get("/",issuesController.getAllIssues);
// get single issue
router.get("/:id",issuesController.getSingleIssue);

export const issuesRoute = router;