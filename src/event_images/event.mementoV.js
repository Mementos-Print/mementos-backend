import axios from "axios";
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import { generateOutpath } from "../utils/outpath.js";

export const processEventMementoV = async (fileBuffer, borderColor, customBorder) => {
    try {

        const outPath = await generateOutpath();

        let image = sharp(fileBuffer);
        const metadata = await image.metadata();
        const { width, height } = metadata;

        let finalWidth, finalHeight, base;

        // Rounded corner radius
        const radius = 50; // adjust to taste

        if (width > height) {
            finalWidth = 705;
            finalHeight = 1100;

            image = image.rotate(90).resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            });

        } else {
            finalWidth = 800;
            finalHeight = 1005;

            image = image.resize({
                width: finalWidth,
                height: finalHeight,
                fit: 'fill'
            });
        }

        const resizedBuffer = await image.toBuffer();

        const roundedMask = Buffer.from(`
            <svg width="${finalWidth}" height="${finalHeight}">
                <rect x="0" y="0" width="${finalWidth}" height="${finalHeight}" rx="${radius}" ry="${radius}" />
            </svg>
        `);

        const roundedImage = await sharp(resizedBuffer)
            .composite([
                { input: roundedMask, blend: "dest-in" }
            ])
            .png()
            .toBuffer();

        if (borderColor === 'custom') {
            const response = await axios.get(customBorder.rows[0].url, { responseType: 'arraybuffer' });
            const customBorderBuffer = Buffer.from(response.data, 'binary');

            base = sharp(customBorderBuffer).resize({
                width: 900,
                height: 1200,
                fit: 'fill'
            });

        } else {
            const color = borderColor === 'black'
                ? { r: 0, g: 0, b: 0 }
                : { r: 255, g: 255, b: 255 };

            base = sharp({
                create: {
                    width: 900,
                    height: 1200,
                    channels: 3,
                    background: color
                }
            });
        }

        let compositeOptions;

        if (width > height) {
            compositeOptions = {
                input: roundedImage,
                bottom: 50,
                top: 50,
                right: 145,
                left: 50
            };
        } else {
            compositeOptions = {
                input: roundedImage,
                right: 50,
                left: 50,
                bottom: 50,
                top: 145
            };
        }

        await base.composite([compositeOptions]).toFile(outPath);
        return outPath;

    } catch (error) {
        console.error("Error processing event polaroids", error);
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