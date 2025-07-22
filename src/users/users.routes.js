import { Router } from "express";
import { loginUserController, loginUserWithGoogleCallback, 
    loginUserWithGoogleCallbackController, loginUserWithGoogleController, 
    signUpUserController
} from "./users.controllers.js";


export const userRouter = Router();

userRouter.post('/signup', signUpUserController);
userRouter.post('/login', loginUserController);
userRouter.get('/auth/google/', loginUserWithGoogleController)
userRouter.get('/auth/google/callback', loginUserWithGoogleCallback, loginUserWithGoogleCallbackController);