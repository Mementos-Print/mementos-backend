import { Router } from "express";
import { auth, staffAuth } from "../middleware/auth.js";
import { createEventController, joinEventsController, viewEventsController } from "./events.controllers.js";
import { uploadImages } from "../middleware/images.js";

export const eventRouter = Router();

eventRouter.post('/', auth, staffAuth, uploadImages, createEventController);
eventRouter.get('/', auth, viewEventsController);
eventRouter.post('/join', auth, joinEventsController);