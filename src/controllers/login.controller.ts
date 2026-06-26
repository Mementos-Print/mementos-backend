import { NextFunction, Request, Response } from "express";
import { loginSchema } from "../dto/login";
import { BadRequestError } from "../utils/app.errors";
import { loginService } from "../services/login.service";


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const result = await loginSchema.parseAsync(req.body);

        if(!result){
            throw new BadRequestError(result);
        };

        const user = await loginService(result.email, result.password);

        return res.status(200).json({
            message: `Logged in successfully`
        });
        
    } catch (error) {
        next(error);
    }
};