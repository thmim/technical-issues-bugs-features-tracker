import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth.middleware";
import { USER_ROLE } from "../../types";

const router = Router();

// issue post api
router.post("/", auth() , issuesController.createIssues);
// all issues get api
router.get("/",issuesController.getAllIssues);
// get single issue
router.get("/:id",issuesController.getSingleIssue);
// update issue route
router.patch("/:id",auth(USER_ROLE.maintainer,USER_ROLE.contributor),issuesController.updateIssue);
// issue delete route
router.delete("/:id",auth(USER_ROLE.maintainer),issuesController.deleteIssue);

export const issuesRoute = router;