import { NextFunction, Request, Response } from "express";
import { loginSchema } from "../dto/login";
import { BadRequestError } from "../utils/app.errors";
import { loginService } from "../services/login.service";
import { buildLoginResponse } from "../services/login-response.service";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loginSchema.parseAsync(req.body);

    if (!result) {
      throw new BadRequestError(result);
    }

    const user = await loginService(result.email, result.password);

    const loginPayload = buildLoginResponse(user);

    return res.status(200).json({ loginPayload });
  } catch (error) {
    next(error);
  }
};
