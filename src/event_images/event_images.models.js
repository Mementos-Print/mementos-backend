import {executeQuery} from "../config/database.js";

export const createEventsImagesTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS event_images(
        imageID VARCHAR(300) PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        style VARCHAR(50),
        status VARCHAR(100) DEFAULT('pending'),
        eventID VARCHAR(6) NOT NULL,
        userID VARCHAR(300) NOT NULL,
        FOREIGN KEY(userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY(eventID) REFERENCES events(eventID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Events Images table", error);
    }
};

export const createUserMementoVTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS event_user_mementoV(
        imageID VARCHAR(300) PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        style VARCHAR(50),
        status VARCHAR(100) DEFAULT('pending'),
        eventID VARCHAR(6) NOT NULL,
        userID VARCHAR(300) NOT NULL,
        FOREIGN KEY(userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY(eventID) REFERENCES events(eventID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Events Images table", error);
    }
};

export const createCustomBordeTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS custom_borders(
        borderID VARCHAR(300) PRIMARY KEY,
        url VARCHAR(300) NOT NULL,
        eventID VARCHAR(6) UNIQUE NOT NULL,
        FOREIGN KEY(eventID) REFERENCES events(eventID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Custom borders table", error);
    }
};