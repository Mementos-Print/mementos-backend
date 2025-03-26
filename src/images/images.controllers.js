import sharp from 'sharp';
import fs from 'fs/promises';
import { deleteImagesFromCloud, saveToCloud } from '../middleware/images.js';
import { findRefreshTokenByStaff, findRefreshTokenByUser } from '../tokens/tokens.services.js';
import { deleteImagesSchema } from '../validators/images.js';
import { deleteImages, getImagesById, getPendingImagesForAdmin, getUploadedImagesForAdmin, uploadImagesToDB } from './images.services.js';


const processImage = async (fileBuffer, style, borderColor) => {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = `uploads/${uniqueId}_edited.png`;

    let image = sharp(fileBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    let finalWidth, finalHeight, borderSize, leftBorder, bottomBorder;

    if (style === 'blank' && width > height) {
        finalWidth = 1100;
        finalHeight = 1700;
        borderSize = 50;

        image = image.rotate(90)
        .resize({
            width: finalWidth,
            height: finalHeight,
            fit: 'fill'
        }).extend({
            top: borderSize,
            bottom: borderSize,
            left: borderSize,
            right: borderSize,
            background: borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
        });
        
    } else if(style === 'blank' && width < height) {
        finalWidth = 1100;
        finalHeight = 1700;
        borderSize = 50;

        image = image.resize({
            width: finalWidth,
            height: finalHeight,
            fit: 'fill'
        }).extend({
            top: borderSize,
            bottom: borderSize,
            left: borderSize,
            right: borderSize,
            background: borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
        })
    } else if(style === 'polaroid' && width > height) {
        finalWidth = 705;
        finalHeight = 1100;
        borderSize = 50;
        leftBorder = 145;

        image = image.rotate(90)
        .resize({
            width: finalWidth,
            height: finalHeight,
            fit: 'fill'
        }).extend({
            top: borderSize,
            bottom: borderSize,
            left: leftBorder,
            right: borderSize,
            background: borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
        })
    } else {
        finalWidth = 800;
        finalHeight = 1005;
        borderSize = 50;
        bottomBorder = 145;

        image = image.resize({
            width: finalWidth,
            height: finalHeight,
            fit: 'fill'
        }).extend({
            top: borderSize,
            bottom: bottomBorder,
            left: borderSize,
            right: borderSize,
            background: borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
        })
    };

    await image.toFile(outPath);
    return outPath;
};

export const uploadImagesController = async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) return res.status(401).json({ Error: "Unauthorized" });

        const { style, borderColor } = req.body;
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

export const getUploadedImagesController = async (req, res) => {
    try {

        const loggedInUser = req.user;

        if(!loggedInUser) {
            return res.status(401).json({
                Error: "Unauthorized."
            })
        };

        const loggedIn = await findRefreshTokenByStaff(loggedInUser.id);

        if(loggedIn.rows.length == 0) {
            return res.status(403).json({
                Error: "This seession has expired. Kindly re-login to continue."
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

        console.error("Error");
        
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

        const loggedIn = await findRefreshTokenByStaff(user.id);

        if(loggedIn.rows.length === 0) {
            return res.status(403).json({
                Error: "This session has expired. Kindly re-login"
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