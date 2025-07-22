import { saveToCloud } from "../middleware/images.js";
import { processEventImages, uploadCustomBorderToDB } from "./event_images.services.js";
import fs from "fs/promises";


export const processEventBorderController = async (files, eventID) => {
  try {

    const style = 'eventBorder';

    // const files = req.files;
    // if (!files || files.length === 0) {
    //   return res.status(400).json({ error: "No file uploaded" });
    // }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      returnjson({ error: "One or more files exceed 5MB limit" });
    }

      const processedImages = await Promise.all(
        files.map(async (file) => {
          const outPath = await processEventImages(file.buffer, style);
          const uploadResult = await saveToCloud(outPath);
          const { public_id, secure_url } = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;

          return {
            public_id,
            secure_url,
            outPath
          };
        })
      );

      await uploadCustomBorderToDB(processedImages, eventID);
    //   res.status(201).json({ photos: processedImages });

      await Promise.all(
        processedImages.map(({ outPath }) =>
          fs.unlink(outPath).catch(err =>
            console.warn(`Failed to delete ${outPath}: ${err.message}`)
          )
        )
      );

  } catch (error) {
    console.error("Error uploading images", error);
    return json({ error: "Internal server error" });
  }
};

export const uploadEventImagesControler = async (req, res) => {
  try {

    const loggedIn = req.user;

    if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});


    
  } catch (error) {

    console.error("Error uploading event images", error);
    
    return res.status(500).json({Error: "Internal Server Error"});
    
  }
};