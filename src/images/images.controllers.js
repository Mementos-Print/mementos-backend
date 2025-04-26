import { saveToCloud } from "../middleware/images.js";
import fs from "fs/promises";
import { uploadImagesToDB, getPendingImagesForAdmin, getUploadedImagesForAdmin } from "./images.services.js";
import { processImage } from "./images.services.js";
import { combinePolaroids } from "./images.services.js";


export const uploadBlankImagesController = async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) return res.status(401).json({ Error: "Unauthorized" });

        const style = 'blank';
        const { borderColor } = req.body;
        const files = req.files;
        
        if (!files || files.length === 0) return res.status(400).json({ error: "No file uploaded" });

        // Process images in parallel
        const processedImages = await Promise.all(
            files.map(async (file) => {
                const outPath = await processImage(file.buffer, style, borderColor);
                const uploadResult = await saveToCloud(outPath);
                const { public_id, secure_url } = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;

                // Return structured results
                return {
                    Message: "File uploaded successfully",
                    public_id: public_id,
                    secure_url: secure_url,
                    outPath
                };
            })
        );

        // save image details to database
        await uploadImagesToDB(processedImages, loggedInUser.id, style);

        res.status(201).json({ photos: processedImages });

        // Delete images after response (non-blocking)
        await Promise.all(
            processedImages.map(({ outPath }) => 
                fs.unlink(outPath).catch(err => console.warn(`Failed to delete ${outPath}: ${err.message}`))
            )
        );

    } catch (error) {
        console.error("Error uploading images", error);
        return res.status(400).json({ Error: "Error uploading Images" });
    }
};


export const uploadPolaroidsController = async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) return res.status(401).json({ Error: "Unauthorized" });

        const style = 'polaroid';
        const { borderColor } = req.body;
        const files = req.files;

        if (!files || files.length === 0)
            return res.status(400).json({ error: "No file uploaded" });
        if (files.length % 2 !== 0)
            return res.status(400).json({ error: "Please upload an even number of images" });

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (files.some((file) => file.size > MAX_FILE_SIZE)) {
            return res.status(400).json({ error: "One or more files exceed 5MB limit" });
        }

        const processedImages = await Promise.all(
            files.map(async (file) => {
                const outPath = await processImage(file.buffer, style, borderColor);
                return outPath;
            })
        );

        const combinedImages = await combinePolaroids(processedImages);

        const uploadedImages = await Promise.all(
            combinedImages.map(async (imagePath) => {
                try {
                    const uploadResults = await saveToCloud(imagePath);
                    if (!uploadResults || !Array.isArray(uploadResults) || uploadResults.length === 0) {
                        throw new Error(`Invalid Cloudinary upload result for ${imagePath}`);
                    }
                    const { public_id, secure_url } = uploadResults[0]; // Take first result
                    return { public_id, secure_url, imagePath };
                } catch (error) {
                    console.error(`Failed to upload ${imagePath}:`, error);
                    throw error;
                }
            })
        );

        await uploadImagesToDB(uploadedImages, loggedInUser.id, style);

        res.status(201).json({ photos: uploadedImages });

        await Promise.all(
            [...processedImages, ...combinedImages].map((outPath) =>
                fs.unlink(outPath).catch((err) =>
                    console.warn(`Failed to delete ${outPath}: ${err.message}`)
                )
            )
        );
    } catch (error) {
        console.error("Error uploading images:", error);
        return res.status(400).json({ Error: error.message || "Error uploading images" });
    }
};

export const getUploadedImagesController = async (req, res) => {
    try {

        const loggedInUser = req.user;

        if(!loggedInUser) {
            return res.status(401).json({
                Error: "Unauthorized."
            })
        };

        const {filter} = req.body;

        if (filter == 'pending') {

            const uploadedImages = await getPendingImagesForAdmin(filter);

            return res.status(200).json({
                PendingImages: uploadedImages.rows
            });

        } else if (filter == 'modified') {

            const uploadedImages = await getPendingImagesForAdmin(filter);

            return res.status(200).json({
                ModifiedImages: uploadedImages.rows
            })

        } 
            const uploadedImages = await getUploadedImagesForAdmin();

        return res.status(200).json({
            AllImages: uploadedImages.rows
        });

    } catch (error) {

        console.error("Error", error);
        
        return res.status(400).json({
            Error: "Error fetching uploaded images"
        });
        
        
    }
};

export const deleteImagesController = async (req, res) => {
    try {

        const user = req.user;

        if(!user) {
            return res.status(401).json({
                Error: "Unauthorized"
            })
        };

        const {error, value} = deleteImagesSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {imageID} = value;

        // Ensure imageID is an array for consistency
        const imageIDs = Array.isArray(imageID) ? imageID : [imageID];
        const images = await getImagesById(imageIDs);

        if(images.rows.length === 0) {
            return res.status(404).json({
                Error: "Image(s) not found"
            })
        };

        // Extract imageIDs from DB response
        const idsToDelete = images.rows.map(({ imageid }) => imageid);

        await deleteImagesFromCloud(idsToDelete);

        await deleteImages(idsToDelete);

        return res.status(200).json({
            Message: "Picture(s) deleted successfully"
        })
        
    } catch (error) {

        console.error("Error deleting images", error);
        
        return res.status(500).json({
            Error: "Error deleting images"
        })
        
    }
};
