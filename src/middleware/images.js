import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { config } from "../config/env.js";


export const cloudConfig = cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImages = upload.array("images");

export const saveToCloud = async (paths) => {
    try {
        const imagePaths = Array.isArray(paths) ? paths : [paths];

        const uploadPromises = imagePaths.map((path) =>
            cloudinary.uploader.upload(path, { folder: 'uploads' })
        );

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
};

export const deleteImagesFromCloud = async (publicIds) => {
    try {
        const imageIDs= Array.isArray(publicIds) ? publicIds : [publicIds];

        await cloudinary.api.delete_resources(imageIDs);
    } catch (error) {
        console.error("Error deleting images:", error);
    }
};