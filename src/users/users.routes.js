import { Router } from "express";
import { loginUserController, validateUserEmailController, validateUserOtpController } from "./users.controllers.js";

export const userRouter = Router();

userRouter.post('/loginUser', loginUserController);
userRouter.post('/validateEmail', validateUserEmailController);
userRouter.post('/validateOtp', validateUserOtpController);