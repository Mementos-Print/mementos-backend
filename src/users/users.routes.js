import { Router } from "express";
import { loginUserController, signUpUserController, validateUserOtpController } from "./users.controllers.js";

export const userRouter = Router();

userRouter.post('/signUp', signUpUserController);
userRouter.post('/verifySignUpOtp', validateUserOtpController);
userRouter.post('/loginUser', loginUserController);