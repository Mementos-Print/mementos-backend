import { Router } from "express";
import { loginStaffController, signUpStaffController } from "./staff.controllers.js";

export const staffRouter = Router();

staffRouter.post('/signup', signUpStaffController);
staffRouter.post('/login', loginStaffController);