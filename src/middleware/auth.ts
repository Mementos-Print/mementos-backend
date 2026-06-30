import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { UnauthorizedError } from "../utils/app.errors";
import { Role } from "@prisma/client";


export class auth {
  static user (req: Request, _res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedError("Missing authorization header");
      }

      const [type, token] = authHeader.split(" ");

      if (type !== "Bearer" || !token) {
        throw new UnauthorizedError("Invalid authorization format");
      }

      const payload = verifyAccessToken(token);

      req.auth = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (err) {
      next(err);
    }
  };

  static staff (req: Request, _res: Response, next: NextFunction) {
    try {
      if(req.auth?.role !== Role.STAFF) throw new UnauthorizedError(`Unathorized!`);
    } catch (error) {
      next(error);
    }
  };

  static admin (req: Request, _res: Response, next: NextFunction) {
    try {
      if(req.auth?.role !== Role.ADMIN) throw new UnauthorizedError(`Unathorized!`);
    } catch (error) {
      next(error);
    }
  };
};