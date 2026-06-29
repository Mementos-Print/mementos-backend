import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app.errors";
import { logger } from "../lib/logger";
import * as z from "zod";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof z.ZodError) {
    const errors = err.issues.map((error) => ({
      field: error.path[0],
      message: error.message,
    }));

    logger.error(errors);
    return res.status(400).json({ errors });
  }

  logger.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};
