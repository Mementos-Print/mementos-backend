import { getEventsByID } from "../events/events.services.js";
import { deleteImagesFromCloud, saveToCloud } from "../middleware/images.js";
import { combineEventPolaroids, getCustomBorder, 
  getEventsImagesForAdmin, 
  getPendingEventsImagesForAdmin, 
  processEventBlanks, processEventBorders,
   processEventPolaroids, updateCustomBorderToDB, uploadCustomBorderToDB, uploadEventImagesToDB 
  } from "./event_images.services.js";
import fs from "fs/promises";


export const processEventBorderController = async (files, eventID) => {
  try {

    const style = 'eventBorder';

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      returnjson({ error: "One or more files exceed 5MB limit" });
    }

      const processedImages = await Promise.all(
        files.map(async (file) => {
          const outPath = await processEventBorders(file.buffer, style);
          const uploadResult = await saveToCloud(outPath);
          const { public_id, secure_url } = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;

          return {
            public_id,
            secure_url,
            outPath
          };
        })
      );

      const eventExists = await getEventsByID('custom_borders', 'eventID', eventID);

      if (eventExists.length === 0) {
        await uploadCustomBorderToDB(processedImages, eventID);
      } else {
        await updateCustomBorderToDB(processedImages, eventID);

        await deleteImagesFromCloud(eventExists[0].borderid);
      }
      
      await Promise.all(
        processedImages.map(({ outPath }) =>
          fs.unlink(outPath).catch(err =>
            console.warn(`Failed to delete ${outPath}: ${err.message}`)
          )
        )
      );

      return processedImages;

  } catch (error) {
    console.error("Error processing event border controller", error);
  }
};

export const uploadEventImagesControler = async (req, res) => {
  try {

    const loggedIn = req.user;

    if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

    const {eventCode} = req.body;

    const eventExists = await getEventsByID('events', 'eventid', eventCode);

    if ( eventExists.length === 0) return res.status(404).json({Error: "Event not found. Kindly check the event code and try again"});

    const style = req.query.style;
    const borderColor = req.query.border;
    const customBorder = await getCustomBorder(eventCode);

    if(borderColor === 'custom' && customBorder.rows.length === 0) return res.status(404).json({Message: "No custom border available for this event"});

    if (!['blank', 'polaroid'].includes(style)) return res.status(400).json({ error: 'Invalid style' });

    if(!['black', 'white', 'custom'].includes(borderColor)) return res.status(400).json({ error: 'Invalid border' });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      return res.status(400).json({ error: "One or more files exceed 5MB limit" });
    };

    if (style === 'blank') {
      const processedImages = await Promise.all(
              files.map(async (file) => {
                const outPath = await processEventBlanks(file.buffer, borderColor, customBorder);
                const uploadResult = await saveToCloud(outPath);
                const { public_id, secure_url } = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;
      
                return {
                  Message: "File uploaded successfully",
                  public_id,
                  secure_url,
                  outPath
                };
              })
            );

            await uploadEventImagesToDB(processedImages, style, eventCode, loggedIn.id);
            res.status(201).json({Photos: processedImages});
            await Promise.all(
              processedImages.map(({outPath}) => {
                fs.unlink(outPath).catch(err => 
                  console.warn(`Failed to delete ${outPath}: ${err.message}`)
                )
              })
            )
            
    } else {
      if (files.length % 2 !== 0) {
              return res.status(400).json({ error: "Please upload an even number of images" });
            }
      
            const processedImages = await Promise.all(
              files.map(file => processEventPolaroids(file.buffer, borderColor, customBorder))
            );
      
            const combinedImages = await combineEventPolaroids(processedImages);
      
            const uploadedImages = await Promise.all(
              combinedImages.map(async (imagePath) => {
                const uploadResults = await saveToCloud(imagePath);
                if (!Array.isArray(uploadResults) || uploadResults.length === 0) {
                  throw new Error(`Invalid Cloudinary upload result for ${imagePath}`);
                }
                const { public_id, secure_url } = uploadResults[0];
                return { public_id, secure_url, imagePath };
              })
            );
      
            await uploadEventImagesToDB(uploadedImages, style, eventCode, loggedIn.id);
            res.status(201).json({ photos: uploadedImages });
      
            await Promise.all(
              [...processedImages, ...combinedImages].map(outPath =>
                fs.unlink(outPath).catch(err =>
                  console.warn(`Failed to delete ${outPath}: ${err.message}`)
                )
              )
            );
    }
    
  } catch (error) {

    console.error("Error uploading event images", error);
    
    return res.status(500).json({Error: "Internal Server Error"});
    
  }
};

export const getUploadedEventImagesForAdminController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) {
            return res.status(401).json({
                Error: "Unauthorized."
            })
        };

        const filter = req.query.filter;
        const eventCode = req.body.eventCode;

        if(!eventCode) return res.status(400).json({Error: "Event code required"});

        if (filter == 'pending') {

            const uploadedImages = await getPendingEventsImagesForAdmin(eventCode, filter);

            return res.status(200).json({
                PendingImages: uploadedImages.rows
            });

        } else if (filter == 'printed') {

            const uploadedImages = await getPendingEventsImagesForAdmin(eventCode, filter);

            return res.status(200).json({
                PrintedImages: uploadedImages.rows
            })

        } 
            const uploadedImages = await getEventsImagesForAdmin(eventCode);

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