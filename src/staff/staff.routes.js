import { Router } from "express";
import { generateResetPasswordOtpController, generateSignupOtpController, loginStaffController, verifyResetPasswordOtpController, verifySignupOtpController } from "./staff.controllers.js";

export const staffRouter = Router();

staffRouter.post('/signup', generateSignupOtpController);
staffRouter.post('/login', loginStaffController);
staffRouter.post('/verifySignupOtp', verifySignupOtpController);
staffRouter.post('/resetPassword', generateResetPasswordOtpController);
staffRouter.post('/verifyPasswordOtp', verifyResetPasswordOtpController);