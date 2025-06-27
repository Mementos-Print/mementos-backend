import { Router } from "express";
import { generateResetPasswordOtpController, loginStaffController,
    loginStaffWithGoogleCallback,
    loginStaffWithGoogleCallbackController,
    loginStaffWithGoogleController,
    signUpStaffController,
    updateStaffRoleController,
    verifyResetPasswordOtpController 
} from "./staff.controllers.js";
import { adminAuth, auth } from "../middleware/auth.js";

export const staffRouter = Router();

staffRouter.post('/signUp', signUpStaffController);
staffRouter.post('/login', loginStaffController);
staffRouter.put('/resetPassword', generateResetPasswordOtpController);
staffRouter.put('/verifyPasswordOtp', verifyResetPasswordOtpController);
staffRouter.put('/updateRole',auth, adminAuth, updateStaffRoleController);
staffRouter.get('/auth/google', loginStaffWithGoogleController)
staffRouter.get('/auth/google/callback', loginStaffWithGoogleCallback, loginStaffWithGoogleCallbackController);