import { Router } from "express";
import { auth, eventAuth, staffAuth } from "../middleware/auth.js";
import { getUploadedEventImagesForAdminController, uploadEventImagesControler } from "./event_images.controllers.js";
import { uploadImages } from "../middleware/images.js";


export const eventImagesRouter = Router();

eventImagesRouter.post('/', auth, eventAuth, uploadImages,uploadEventImagesControler);
eventImagesRouter.get('/library', auth, staffAuth, getUploadedEventImagesForAdminController);