import type { Request, Response } from "express";
import { userServices } from "./auth.service";

const createUser =  async (req: Request, res: Response) => {
  //   console.log(req.body);
//   const { name, email, password } = req.body;

  try {
    const result = await userServices.createUserIntoDb(req.body)
    // console.log(result);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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

export const userController = {
    createUser,
}