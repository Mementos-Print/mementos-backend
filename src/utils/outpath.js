import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

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