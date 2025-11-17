import axios from "axios";
import sharp from "sharp";
import { generateOutpath } from "../utils/outpath.js";

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
