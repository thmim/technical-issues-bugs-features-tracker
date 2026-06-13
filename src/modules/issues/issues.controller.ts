import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

// create issue response
const createIssues = async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.user?.id);
//   const { name, email, password } = req.body;
const payload = {
  ...req.body,
  reporter_id:req.user?.id
}

  try {
    const result = await issuesService.createIssuesIntoDb(payload)
    console.log("reqq theke",result);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }

}

// get all issues response
const getAllIssues = async (req: Request, res: Response) =>{

// console.log(result)
try {
  const data = await issuesService.getAllIssuesFromDb();
  res.status(201).json({
      success: true,
      message: "Issues retrived successfully",
      data: data
    });
} catch (error:any) {
  res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
}
}

export const issuesController = {
    createIssues,
    getAllIssues
}