import { Router } from "express";
import { logoutStaffController, logoutUserController, refreshStaffTokenController, refreshUserTokenController } from "./tokens.controllers.js";
import { auth } from "../middleware/auth.js";


export const tokenRouter = Router();

tokenRouter.post('/refreshStaff', refreshStaffTokenController);
tokenRouter.post('/refreshUser', refreshUserTokenController);
tokenRouter.delete('/logoutStaff', auth, logoutStaffController);
tokenRouter.delete('/logoutUser', auth, logoutUserController);