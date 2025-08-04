import { Router } from "express";
import { userRouter } from "../users/users.routes.js";
import { tokenRouter } from "../tokens/tokens.routes.js";
import { imagesRouter } from "../images/images.routes.js";
import { staffRouter } from "../staff/staff.routes.js";
import { eventRouter } from "../events/events.routes.js";
import { eventImagesRouter } from "../event_images/event_images.routes.js";

export const routes = Router();

routes.use('/users', userRouter);
routes.use('/tokens', tokenRouter);
routes.use('/images', imagesRouter);
routes.use('/staff',staffRouter);
routes.use('/events', eventRouter);
routes.use('/event/images', eventImagesRouter);