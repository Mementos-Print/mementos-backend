import { executeQuery } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";


export const uploadEventImages =  async (imageID, url, style, eventID, userID) => {

    try {

        const query = `
        INSERT INTO event_images(imageID, url, style, eventID, userID)
        VALUES($1, $2, $3, $4, $5);
        `;

        const values = [imageID, url, style, eventID, userID];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into event_images table", error);
    }
    
};

export const getEventsImagesForAdmin =  async (eventID) => {
    try {

        const query = `
        SELECT imageID, url, name FROM event_images e JOIN users u
        on e.userID = i.userID AND eventID = 1$;
        `;

        const results = await executeQuery(query, [eventID]);
        
    } catch (error) {
        console.error("Error querying event_images table", error);
    }
};

export const getEventsImagesForUsers =  async (userID) => {
    try {

        const query = `
        SELECT imageID, url, name FROM event_images e JOIN users u
        on e.userID = i.userID AND eventID = 1$;
        `;

        const results = await executeQuery(query, [userID]);
        
    } catch (error) {
        console.error("Error querying event_images table", error);
    }
};

export const uploadCustomBorder = async (borderID, URL, eventID) => {
    try {

        const query = `
        INSERT INTO custom_borders(borderID, URL, eventID)
        VALUES($1, $2, $3);
        `;

        const values =  [borderID, URL, eventID];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error Inserting into custom_borders table", error);
    }
};

export const uploadCustomBorderToDB = async (uploadResults, eventID) => {
    try {
        const savePromises = uploadResults.map(({ public_id, secure_url }) => 
            uploadCustomBorder(public_id, secure_url, eventID)
        );

        await Promise.all(savePromises);
    } catch (error) {
        console.error("Error saving custom border to DB:", error);
    }
};

export const processEventImages = async (fileBuffer, style, borderColor) => {

    try {

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
        } else if(style === 'eventBorder' && width > height){
            finalWidth = 1200;
            finalHeight = 1800;

            image = image.rotate(90)
            .resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })
        } else if (style === 'eventBorder' && width < height){
            finalWidth = 1200;
            finalHeight = 1800;

            image = image.resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
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
        
    } catch (error) {
        console.error("Error processing event images", error);
        return res.status(500).json({Error: "Internal server error"})
    }
};

// export const addBorder = async (params) => {
//     try {
        
//     } catch (error) {
//         console.error("Error adding border to event images", error);
//         return res.status(500).json({Error: "Internal server error"});
//     }
// }

export const combineEventPolaroids = async (imagePaths) => {
    
    try {

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
        
    } catch (error) {
        console.error("Error combining event polaroids", error)
    }

};