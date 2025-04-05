import { Router } from "express";
import { auth, staffAuth } from "../middleware/auth.js";
import { uploadImages } from "../middleware/images.js";
import { deleteImagesController, getUploadedImagesController } from "./images.controllers.js";
import { uploadBlankImagesController, uploadPolaroidsController } from "./images.controllers.js";


export const imagesRouter = Router();

imagesRouter.post('/uploadBlank', auth, uploadImages, uploadBlankImagesController);
imagesRouter.post('/uploadPolaroid', auth, uploadImages, uploadPolaroidsController)
imagesRouter.get('/gallery', auth, staffAuth, getUploadedImagesController);
imagesRouter.delete('/delete', auth, staffAuth, deleteImagesController);