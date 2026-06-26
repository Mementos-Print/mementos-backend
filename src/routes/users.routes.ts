import {Router} from "express";
import { registerController } from "../controllers/register.controller";
import { loginController } from "../controllers/login.controller";

export const userRouter = Router();

userRouter.post("/register", registerController);
userRouter.post("/login", loginController);