import { Router } from "express";
import { registerController } from "../controllers/register.controller";
import { loginController } from "../controllers/login.controller";
import { OAuth } from "../middleware/OAuth";
import { OAuthCallbackController } from "../controllers/OAuth.controller";

export const userRouter = Router();

userRouter.post("/register", registerController);
userRouter.post("/login", loginController);
userRouter.get("/google", OAuth.googleSignIn);
userRouter.get("/google/callback", OAuth.googleSignInCallback, OAuthCallbackController,);