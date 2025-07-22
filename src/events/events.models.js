import {executeQuery} from "../config/database.js";

export const createEventsTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS events(
        eventID VARCHAR(6) NOT NULL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        theme VARCHAR(50) NOT NULL,
        staff VARCHAR(300) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(100) DEFAULT('pending'),
        FOREIGN KEY(staff) REFERENCES staff(staffID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Events table", error);
    
    }
};

export const createEventsUsers = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS event_users(
        ID VARCHAR(300) PRIMARY KEY,
        userID VARCHAR(300) NOT NULL,
        eventID VARCHAR(50) NOT NULL,
        joinedAt TIMESTAMP DEFAULT(CURRENT_TIMESTAMP),
        FOREIGN KEY(userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY(eventID) REFERENCES events(eventID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Event_users table", error);
    
    }
};