import { Router } from "express";
import { generateResetPasswordOtpController, loginStaffController,
    signUpStaffController,
    verifyResetPasswordOtpController, verifySignupOtpController } from "./staff.controllers.js";

export const staffRouter = Router();

staffRouter.post('/signUp', signUpStaffController);
staffRouter.post('/verifySignUpOtp', verifySignupOtpController);
staffRouter.post('/login', loginStaffController);
staffRouter.post('/resetPassword', generateResetPasswordOtpController);
staffRouter.post('/verifyPasswordOtp', verifyResetPasswordOtpController);