import { Router } from "express";
import { loginUserController } from "./users.controllers.js";

export const userRouter = Router();

userRouter.post('/loginUser', loginUserController);