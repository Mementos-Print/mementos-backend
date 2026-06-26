import { Router } from "express";
import { userRouter } from "../routes/users.routes";

export const routes = Router();

routes.use('/users',userRouter);