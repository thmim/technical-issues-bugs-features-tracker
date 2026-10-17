import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: any, // type unknown dileo hobe
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error-",
  });
};

export default globalErrorHandler;