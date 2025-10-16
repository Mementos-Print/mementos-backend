import { getEventsByID } from "../events/events.services.js";
import { getPendingImagesForAdmin, getUploadedImagesForAdmin } from "../images/images.services.js";
import { deleteImagesFromCloud, saveToCloud } from "../middleware/images.js";
import { combineEventMementoV, getCustomBorder, 
  getEventsImagesForAdmin, 
  getPendingEventsImagesForAdmin, 
  processEventBorders,
  processEventMementoS,
  processEventMementoV,
  updateCustomBorderToDB, uploadCustomBorderToDB, uploadEventImagesToDB 
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

      if (eventExists.rows.length === 0) {
        await uploadCustomBorderToDB(processedImages, eventID);
      } else {
        await updateCustomBorderToDB(processedImages, eventID);

        await deleteImagesFromCloud(eventExists.rows[0].borderid);
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

    const eventCode = req.query.eventCode;
    const style = req.query.style;
    const borderColor = req.query.border;

    if(!eventCode) return res.status(400).json({error: "Event code is required"});
    if (!['mementoS', 'mementoV'].includes(style)) return res.status(400).json({ error: 'Invalid style' });
    
    if(!['black', 'white', 'custom'].includes(borderColor)) return res.status(400).json({ error: 'Invalid border' });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      return res.status(400).json({ error: "One or more files exceed 5MB limit" });
    };

    const eventExists = await getEventsByID('events', 'eventid', eventCode);

    if ( eventExists.rows.length === 0) return res.status(404).json({error: "Event not found. Kindly check the event code and try again"});
    
    const customBorder = await getCustomBorder(eventCode);

    if(borderColor === 'custom' && customBorder.rows.length === 0) return res.status(404).json({Message: "No custom border available for this event"});

    if (style === 'mementoS') {
      const processedImages = await Promise.all(
              files.map(async (file) => {
                const outPath = await processEventMementoS(file.buffer, borderColor, customBorder);
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

            await uploadEventImagesToDB('event_images', processedImages, style, eventCode, loggedIn.id);
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
              files.map(file => processEventMementoV(file.buffer, borderColor, customBorder))
            );

            // save single images to DB to display on users dashboard
            const uploadResult = await saveToCloud(processedImages);
            const { public_id, secure_url } = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;
            await uploadEventImagesToDB('event_user_mementoV', uploadResult, style, eventCode, loggedIn.id);
      
            const combinedImages = await combineEventMementoV(processedImages);
      
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
      
            await uploadEventImagesToDB('event_images', uploadedImages, style, eventCode, loggedIn.id);
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
    
    return res.status(500).json({error: "Internal Server Error"});
    
  }
};

export const getUploadedEventImagesForStaffController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) {
            return res.status(401).json({
                error: "Unauthorized."
            })
        };

        const filter = req.query.filter;

        if(loggedInStaff.role === 'admin'){

          if (filter == 'pending') {

            const eventImages = await getPendingEventsImagesForAdmin(loggedInStaff.id, filter);
            const uploadedImages = await getPendingImagesForAdmin(filter);

            return res.status(200).json({
                PendingEventImages: eventImages.rows, 
                PendindUploadedImages: uploadedImages.rows
            });

        } else if (filter == 'printed') {

            const eventImages = await getPendingEventsImagesForAdmin(loggedInStaff.id, filter);
            const uploadedImages = await getPendingImagesForAdmin(filter);

            return res.status(200).json({
                PrintedEventImages: eventImages.rows,
                PrintedUploadedImages: uploadedImages
            })

        } 
            const eventImages = await getEventsImagesForAdmin(loggedInStaff.id);
            const uploadedImages = await getUploadedImagesForAdmin();

        return res.status(200).json({
            AllEventImages: eventImages.rows,
            AllUploadedImages: uploadedImages
        });

        } else{

          if (filter == 'pending') {

            const uploadedImages = await getPendingEventsImagesForAdmin(loggedInStaff.id, filter);

            return res.status(200).json({
                PendingImages: uploadedImages.rows
            });

        } else if (filter == 'printed') {

            const uploadedImages = await getPendingEventsImagesForAdmin(loggedInStaff.id, filter);

            return res.status(200).json({
                PrintedImages: uploadedImages.rows
            })

        } 
            const uploadedImages = await getEventsImagesForAdmin(loggedInStaff.id);

        return res.status(200).json({
            AllImages: uploadedImages.rows
        });

        };

    } catch (error) {

        console.error("Error", error);
        
        return res.status(400).json({
            error: "Error fetching uploaded images"
        });
        
        
    }
};