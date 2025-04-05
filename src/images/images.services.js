import { executeQuery } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";


export const processImage = async (fileBuffer, style, borderColor) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, 'uploads');

    async function ensureUploadsFolderExists() {
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            console.error("Error creating uploads folder:", error);
        }
    }

    // Call function to ensure the folder exists
    await ensureUploadsFolderExists();

    // Generate a unique ID
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Construct the output file path
    const outPath = path.join(uploadsDir, `${uniqueId}_edited.png`);

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

export const combinePolaroids = async (imagePaths) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, "Uploads");

    await fs.mkdir(uploadsDir, { recursive: true });

    const combinedImages = [];

    for (let i = 0; i < imagePaths.length; i += 2) {
        const leftImagePath = imagePaths[i];
        const rightImagePath = imagePaths[i + 1] || leftImagePath;

        const leftImage = sharp(leftImagePath)
        const rightImage = sharp(rightImagePath)

        const [leftBuffer, rightBuffer] = await Promise.all([
            leftImage.toBuffer(),
            rightImage.toBuffer(),
        ]);

        const combinedImageBuffer = await sharp({
            create: {
                width: 1800,
                height: 1200,
                channels: 3,
                background: { r: 255, g: 255, b: 255 },
            },
        })
            .composite([
                { input: leftBuffer, top: 0, left: 0 },
                { input: rightBuffer, top: 0, left: 900 },
            ])
            .jpeg({ quality: 80 })
            .toBuffer();

        const combinedImagePath = path.join(uploadsDir, `combined_${i}.jpg`);
        await fs.writeFile(combinedImagePath, combinedImageBuffer);

        combinedImages.push(combinedImagePath);
    }

    return combinedImages;
};

export const uploadImage = async (imageID, imageURL, userID, style) => {
    try {

        const query = `
        INSERT INTO images(imageID, imageURL, userID, style)
        VALUES($1, $2, $3, $4);
        `;

        const values =  [imageID, imageURL, userID, style];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error Inserting into images table", error);
    }
};

export const uploadImagesToDB = async (uploadResults, userId, style) => {
    try {
        const savePromises = uploadResults.map(({ public_id, secure_url }) => 
            uploadImage(public_id, secure_url, userId, style)
        );

        await Promise.all(savePromises);
    } catch (error) {
        console.error("Error saving images to DB:", error);
    }
};

export const getUploadedImagesForAdmin = async() => {
    try {

        const query = `
        SELECT imageid, imageurl, name FROM images JOIN users USING(userid);
        `;

        const results = await executeQuery(query, []);

        return results;
        
    } catch (error) {
        console.error("Error fetching from images table", error);
    }
};

export const getPendingImagesForAdmin = async(status) => {
    try {

        const query = `
        SELECT imageid, imageurl, name FROM images JOIN users USING(userid) 
        WHERE status = $1;
        `;

        const results = await executeQuery(query, [status]);

        return results;
        
    } catch (error) {
        console.error("Error fetching from images table", error);
    }
};

export const deleteImages = async (imageIDs) => {
    try {

        const query = `
        DELETE FROM images WHERE imageID = ANY($1);
        `;

        await executeQuery(query, [imageIDs]);
        
    } catch (error) {
        console.error("Error deleting from images table", error);
    }
};

export const getImagesById = async(imageIDs) => {
    try {

        const query = `
        SELECT * FROM images WHERE imageid = ANY($1);
        `;

        const results = await executeQuery(query, [imageIDs]);

        return results;
        
    } catch (error) {
        console.error("Error fetching from images table", error);
    }
};

export const updateImagesStatus = async (status, imageID) => {
    try {

        const query = `
        UPDATE images set status = $1 WHERE imageID = $2;
        `;

        await executeQuery(query, [status, imageID]);
        
    } catch (error) {
        console.error("Error updating image status", error);
    }
};