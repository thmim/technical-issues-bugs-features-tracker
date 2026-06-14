import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

// create issue response
const createIssues = async (req: Request, res: Response) => {
  
  // all necessary data (issue data from req.body and user data from req.user) set in one variable
  const payload = {
    ...req.body,
    reporter_id: req.user?.id
  }

  try {
    const result = await issuesService.createIssuesIntoDb(payload)

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
  const {sort,status,type} = req.query;
  // console.log(result)
  try {
    const data = await issuesService.getAllIssuesFromDb({
      sort:sort as string,
      status:status as string,
      type:type as string
    });
    
    if(data.length === 0){
      return res.status(404).json({
      success: false,
      message: "Issues not found",
      data: data
    });
    }

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
  // console.log(user?.id)
  
    try {
      // get existing issue for matching role and ids condition
    const existingIssue =
      await issuesService.getSingleIssueFromDb(id as string);

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Contributor rules
    if (user?.role === "contributor") {

      // Can update only own issue
      console.log(existingIssue[0]?.reporter.id !== user.id)
      if (existingIssue[0]?.reporter.id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You can update only your own issues",
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