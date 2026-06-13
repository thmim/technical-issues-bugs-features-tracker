import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

// create issue response
const createIssues = async (req: Request, res: Response) => {
  // console.log(req.body);
  // console.log(req.user?.id);
  //   const { name, email, password } = req.body;
  const payload = {
    ...req.body,
    reporter_id: req.user?.id
  }

  try {
    const result = await issuesService.createIssuesIntoDb(payload)
    // console.log("reqq theke", result);

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
const getAllIssues = async (req: Request, res: Response) => {
  const sort = req.query.sort as string;
  // console.log(result)
  try {
    const data = await issuesService.getAllIssuesFromDb(sort);
    res.status(201).json({
      success: true,
      message: "Issues retrived successfully",
      data: data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}

// get single issue response
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id)
  try {
    const data = await issuesService.getSingleIssueFromDb(id as string)

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      })
    }

    res.status(201).json({
      success: true,
      message: "Issue retrived successfully",
      data: data
    })


  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error
    })
  }
}

// update issue response
const updateIssue = async (req: Request, res: Response) =>{
  const user = req.user;
  const { id } = req.params;
  
    try {
      // get existing issue
    const existingIssue =
      await issuesService.getSingleIssueFromDb(id as string);
      // console.log(existingIssue[0]?.status)

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Contributor rules
    if (user?.role === "contributor") {

      // Can update only own issue
      if (existingIssue[0]?.reporter.id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You can update your own issues",
        });
      }

      // update only if status is open
      if (existingIssue[0]?.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "you have no access",
        });
      }
    }

    // here is the update response
    const result = await issuesService.updateIssueFromDb(
      id as string,
      req.body
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {},
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// issue delete response
const deleteIssue = async (req: Request, res: Response) =>{
   const { id } = req.params;

  try {
    const result = await issuesService.deleteIssueFromDb(id as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {},
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
      
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }

}



export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
}