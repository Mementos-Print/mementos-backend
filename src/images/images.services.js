import { executeQuery } from "../config/database.js";

export const uploadImage = async (tableName, imageID, imageURL, userID, style) => {
    try {

        const query = `
        INSERT INTO ${tableName}(imageID, imageURL, userID, style)
        VALUES($1, $2, $3, $4);
        `;

        const values =  [imageID, imageURL, userID, style];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error Inserting into images table", error);
    }
};

export const uploadImagesToDB = async (tableName, uploadResults, userId, style) => {
    try {
        const savePromises = uploadResults.map(({ public_id, secure_url }) => 
            uploadImage(tableName, public_id, secure_url, userId, style)
        );

        await Promise.all(savePromises);
    } catch (error) {
        console.error("Error saving images to DB:", error);
    }
};

export const getUploadedImagesForAdmin = async() => {
    try {

        const query = `
        SELECT imageid, imageurl, name FROM images JOIN users USING(userid)
        ORDER BY uploadedAt DESC;
        `;

        const results = await executeQuery(query, []);

        return results;
        
    } catch (error) {
        console.error("Error fetching from images table", error);
    }
};

export const getUploadedImagesForUsers = async (userID) => {
    try {

        const query = `
        SELECT imageid, imageurl, uploadedAt FROM images JOIN users USING(userID) WHERE userID = $1
        ORDER BY uploadedAt DESC;
        `;

        const result = await executeQuery(query, [userID]);

        return result;
        
    } catch (error) {
        console.error("Error querying images table", error);
    }
};

export const getPendingImagesForAdmin = async(status) => {
    try {

        const query = `
        SELECT imageid, imageurl, name FROM images JOIN users USING(userid) 
        WHERE status = $1 ORDER BY uploadedAt DESC;
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