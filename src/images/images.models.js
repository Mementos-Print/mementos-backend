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

export const createUserMementoVTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS user_mementoV(
        imageID VARCHAR(300) PRIMARY KEY,
        imageURL VARCHAR(300) NOT NULL,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        style VARCHAR(50),
        status VARCHAR(100) DEFAULT('pending'),
        userID VARCHAR(300) NOT NULL,
        FOREIGN KEY(userID) REFERENCES users(userID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Events Images table", error);
    }
};