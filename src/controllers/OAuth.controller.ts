import { Request, Response, NextFunction } from "express";
import { aToken, rToken } from "../lib/jwt";
import { OAuthResult } from "../dto/OAuth";
import { sanitizeAuthUser } from "../utils/sanitize";

export const OAuthCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req.user as OAuthResult;

        const sanitizedUser = sanitizeAuthUser(user);
    
        const accessToken = aToken({
          id: sanitizedUser.id,
          email: sanitizedUser.email,
          role: user.role,
        });
        
        const refreshToken = rToken({
          id: sanitizedUser.id,
          email: sanitizedUser.email,
          role: user.role
        });
    
        res.status(200).json({
          message: "User logged in successfully",
          sanitizedUser,
          accessToken,
          refreshToken,
        });

      } catch (error) {
        next(error);
  }
};