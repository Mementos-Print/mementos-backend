import { Router } from "express";
import { auth, staffAuth } from "../middleware/auth.js";
import { createEventController, deleteEventController, joinEventsController, updateEventController, viewEventsController } from "./events.controllers.js";
import { uploadImages } from "../middleware/images.js";

export const eventRouter = Router();

eventRouter.post('/', auth, staffAuth, uploadImages, createEventController);
eventRouter.get('/', auth, staffAuth, viewEventsController);
eventRouter.post('/join', auth, joinEventsController);
eventRouter.delete('/', auth, staffAuth, deleteEventController);
eventRouter.patch('/:eventCode', auth, staffAuth, uploadImages, updateEventController);