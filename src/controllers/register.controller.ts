import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../dto/register";
import { registerService } from "../services/register.service";
import { BadRequestError } from "../utils/app.errors";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await registerSchema.parseAsync(req.body);

    if (!result) {
      throw new BadRequestError(result);
    };

    const user = await registerService(result);

    return res.status(201).json({
        message: `Account created successfully`,
        user_id: user?.id,
        user_email: user?.email
    });
  } catch (error) {
    next(error);
  }
};
