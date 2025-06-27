import { Router } from "express";
import { loginUserController, loginUserWithGoogleCallback, 
    loginUserWithGoogleCallbackController, loginUserWithGoogleController, 
    signUpUserController
} from "./users.controllers.js";


export const userRouter = Router();

userRouter.post('/signupUser', signUpUserController);
userRouter.post('/loginUser', loginUserController);
userRouter.get('/auth/google/', loginUserWithGoogleController)
userRouter.get('/auth/google/callback', loginUserWithGoogleCallback, loginUserWithGoogleCallbackController);