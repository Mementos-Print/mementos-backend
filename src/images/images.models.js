import { executeQuery } from "../config/database.js";


export const createImagesTable = async() => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS images(
        imageID VARCHAR(300) NOT NULL PRIMARY KEY,
        imageURL VARCHAR(300) NOT NULL,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(100) DEFAULT('pending'),
        userID VARCHAR(300) NOT NULL,
        style VARCHAR(50),
        FOREIGN KEY(userID) REFERENCES users(userID)
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Images table", error);
    }
};