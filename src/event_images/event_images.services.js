import { executeQuery } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import axios from "axios";


export const uploadEventImages =  async (tableName, imageID, url, style, eventID, userID) => {

    try {

        const query = `
        INSERT INTO ${tableName}(imageID, url, style, eventID, userID)
        VALUES($1, $2, $3, $4, $5);
        `;

        const values = [imageID, url, style, eventID, userID];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into event_images table", error);
    }
    
};

export const uploadEventImagesToDB = async (tableName, uploadResults, style, eventID, userID) => {
    try {
        const savePromises = uploadResults.map(({ public_id, secure_url }) => 
            uploadEventImages(tableName, public_id, secure_url, style, eventID, userID)
        );

        await Promise.all(savePromises);
    } catch (error) {
        console.error("Error saving event images to DB:", error);
    }
};

export const getEventsImagesForAdmin =  async (staffID) => {
    try {

        const query = `
        SELECT imageID, url, name "uploaderName", title event FROM event_images eimg
        JOIN users u on eimg.userID = u.userID
        JOIN events ev ON eimg.eventID = ev.eventID
        WHERE ev.staff = $1;
        `;
        
        const results = await executeQuery(query, [staffID]);
        
        return results;
        
    } catch (error) {
        console.error("Error querying event_images table", error);
    }
};

export const getPendingEventsImagesForAdmin =  async (staffID, status) => {
    try {

        const query = `
        SELECT imageID, url, name "uploaderName", title event FROM event_images eimg
        JOIN users u on eimg.userID = u.userID
        JOIN events ev ON eimg.eventID = ev.eventID
        WHERE ev.staff = $1 AND eimg.status = $2
        ORDER BY uploadedAt DESC;
        `;
        
        const results = await executeQuery(query, [staffID, status]);
        
        return results;
        
    } catch (error) {
        console.error("Error querying event_images table", error);
    }
};

export const getEventsImagesForUsers =  async (tableName, userID, style) => {
    try {

        const query = `
        SELECT imageID, url FROM ${tableName} WHERE userID = $1 AND style = $2
        ORDER BY uploadedAt DESC;
        `;

        const results = await executeQuery(query, [userID, style]);

        return results;
        
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

export const updateCustomBorder = async (borderID, URL, eventID) => {
    try {

        const query = `
        UPDATE custom_borders
        SET 
        borderID = $1,
        URL = $2
        WHERE eventID = $3;
        `;

        const values =  [borderID, URL, eventID];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error updating custom_borders table", error);
    }
};

export const updateCustomBorderToDB = async (uploadResults, eventID) => {
    try {
        const savePromises = uploadResults.map(({ public_id, secure_url }) => 
            updateCustomBorder(public_id, secure_url, eventID)
        );

        await Promise.all(savePromises);
    } catch (error) {
        console.error("Error saving custom border to DB:", error);
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

export const getCustomBorder = async (eventID) => {
    try {

        const query = `
        SELECT * FROM custom_borders WHERE eventID = $1;
        `;

        const results = await executeQuery(query, [eventID]);

        return results;
        
    } catch (error) {
        console.error("Error querying custom_borders table", error);
    }
};

export const generateOutpath = async () => {
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


        return outPath;
        
    } catch (error) {
        console.log("Error processing generating outpath", error);
    }
};

export const processEventMementoS = async (fileBuffer, borderColor, customBorder) => {
    try {

        const outPath = await generateOutpath();

        let image = sharp(fileBuffer);
        const metadata = await image.metadata();
        const { width, height } = metadata;

        let finalWidth, finalHeight, borderSize

        if (width > height) {
            finalWidth = 1100;
            finalHeight = 1700;
            borderSize = 50;

            image = image.rotate(90)
            .resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })
        
        } else if (width < height) {
            finalWidth = 1100;
            finalHeight = 1700;
            borderSize = 50;

            image = image.resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })
        }

        image = await image.toBuffer();

        let base;

        if(borderColor === 'custom') {
            const response = await axios.get(customBorder.rows[0].url, { responseType: 'arraybuffer' });
            const customBorderBuffer = Buffer.from(response.data, 'binary');
            base = sharp(customBorderBuffer);
        } else {

            const color = borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
            
            base = sharp({
                create: {
                    width: 1200,
                    height: 1800,
                    channels: 3,
                    background: color
                }
            });

        }

        image = base.composite([{
            input: image,
            top: 50,
            left: 50
        }]);

        await image.toFile(outPath);
        return outPath;
        
    } catch (error) {
        console.error("Error processing event images", error);
    }
};

export const processEventMementoV = async (fileBuffer, borderColor, customBorder) => {
    try {

        const outPath = await generateOutpath();

        let image = sharp(fileBuffer);
        const metadata = await image.metadata();
        const { width, height } = metadata;

        let finalWidth, finalHeight, borderSize, base, bottomBorder, leftBorder;

        if( width > height) {
            finalWidth = 705;
            finalHeight = 1100;
            borderSize = 50;
            leftBorder = 145;

            image = image.rotate(90)
            .resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })

            image = await image.toBuffer();

            if (borderColor === 'custom') {
                const response = await axios.get(customBorder.rows[0].url, { responseType: 'arraybuffer' });
                const customBorderBuffer = Buffer.from(response.data, 'binary');
                base = sharp(customBorderBuffer)
                .resize({
                    width: 900,
                    height: 1200,
                    fit: 'fill'
                });
            } else {
                const color = borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
            
                base = sharp({
                    create: {
                        width: 900,
                        height: 1200,
                        channels: 3,
                        background: color
                    }
                });
            }

            image = base.composite([{
                input: image,
                top: 50,
                left: 145
            }])

            await image.toFile(outPath);
            return outPath;

        } else if (width < height){
            finalWidth = 800;
            finalHeight = 1005;
            borderSize = 50;
            bottomBorder = 145;

            image = image.resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })

            image = await image.toBuffer();

            if (borderColor === 'custom') {
                const response = await axios.get(customBorder.rows[0].url, { responseType: 'arraybuffer' });
                const customBorderBuffer = Buffer.from(response.data, 'binary');
                base = sharp(customBorderBuffer)
                .resize({
                    width: 900,
                    height: 1200,
                    fit: 'fill'
                });
            } else {
                const color = borderColor === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
            
                base = sharp({
                    create: {
                        width: 900,
                        height: 1200,
                        channels: 3,
                        background: color
                    }
                });
            }

            image = base.composite([{
                input: image,
                left: 50,
                top: 50,
            }])

            await image.toFile(outPath);
            return outPath;

        };
        
    } catch (error) {
        console.error("Error processing event polaroids", error);
    }
};

export const processEventBorders = async (fileBuffer) => {

    try {

        const outPath = await generateOutpath();

        let image = sharp(fileBuffer);
        const metadata = await image.metadata();
        const { width, height } = metadata;

        let finalWidth, finalHeight

        if (width > height){
            finalWidth = 1200;
            finalHeight = 1800;

            image = image.rotate(90)
            .resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })
        } else {
            finalWidth = 1200;
            finalHeight = 1800;

            image = image.resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            })
        } 

        await image.toFile(outPath);
        return outPath;
        
    } catch (error) {
        console.error("Error processing event border", error);
    }
};

export const combineEventMementoV = async (imagePaths) => {
    
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