import { Router } from "express";
import { auth, staffAuth } from "../middleware/auth.js";
import { uploadImages } from "../middleware/images.js";
import { deleteImagesController, getUploadedImagesController, uploadImagesController } from "./images.controllers.js";


export const imagesRouter = Router();

imagesRouter.post('/upload', auth, uploadImages, uploadImagesController);
imagesRouter.get('/gallery', auth, staffAuth, getUploadedImagesController);
imagesRouter.delete('/delete', auth, staffAuth, deleteImagesController);