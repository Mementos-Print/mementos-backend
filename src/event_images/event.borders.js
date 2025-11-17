import sharp from "sharp";
import { generateOutpath } from "../utils/outpath.js";

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