import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { OAuthResult } from "../dto/OAuth";

export class OAuth {
  static googleSignIn(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-auth", {
      scope: ["profile", "email"],
      session: false,
    })(req, res, next);
  }

  static googleSignInCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google-auth",
      { session: false },
      (err: Error, user: OAuthResult) => {
        if (err) return next(err);

        if (!user) {
          return next(new Error("Google authentication failed"));
        }

        req.user = user;
        next();
      },
    )(req, res, next);
  }
}
