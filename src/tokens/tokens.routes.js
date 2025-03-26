import { Router } from "express";
import { logoutStaffController, logoutUserController, refershStaffTokenController, refershUserTokenController } from "./tokens.controllers.js";
import { auth } from "../middleware/auth.js";


export const tokenRouter = Router();

tokenRouter.post('/refreshStaff', refershStaffTokenController);
tokenRouter.post('/refreshUser', refershUserTokenController);
tokenRouter.delete('/logoutStaff', auth, logoutStaffController);
tokenRouter.delete('/logoutUser', auth, logoutUserController);