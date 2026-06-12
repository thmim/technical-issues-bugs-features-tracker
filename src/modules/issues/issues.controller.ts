import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssues = async (req: Request, res: Response) => {
  //   console.log(req.body);
//   const { name, email, password } = req.body;

  try {
    const result = await issuesService.createIssuesIntoDb(req.body)
    // console.log(result);

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

export const issuesController = {
    createIssues,
}