import { Router } from "express";
import { loginUserController, loginUserWithGoogleCallback, 
    loginUserWithGoogleCallbackController, loginUserWithGoogleController, 
    signUpUserController
} from "./users.controllers.js";


export const userRouter = Router();
export const router = Router();

userRouter.post('/signupUser', signUpUserController);
userRouter.post('/loginUser', loginUserController);
router.get('/google', loginUserWithGoogleController);
router.get('/google/callback', loginUserWithGoogleCallback, loginUserWithGoogleCallbackController);