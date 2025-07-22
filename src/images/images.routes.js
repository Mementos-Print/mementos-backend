import { Router } from "express";
import { auth, staffAuth } from "../middleware/auth.js";
import { uploadImages } from "../middleware/images.js";
import { deleteImagesController, getUploadedImagesForAdminController,
    getUploadedImagesForUsersController, uploadImagesController 
} from "./images.controllers.js";


export const imagesRouter = Router();

imagesRouter.post('/upload', auth, uploadImages, uploadImagesController);
imagesRouter.get('/library', auth, staffAuth, getUploadedImagesForAdminController);
imagesRouter.get('/my-library', auth, getUploadedImagesForUsersController);
imagesRouter.delete('/', auth, staffAuth, deleteImagesController);