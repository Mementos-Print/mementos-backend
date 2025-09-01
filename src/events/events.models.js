import {executeQuery} from "../config/database.js";

export const createEventsTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS events(
        eventID VARCHAR(6) NOT NULL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        staff VARCHAR(300) NOT NULL,
        event_date DATE NOT NULL,
        status VARCHAR(100) DEFAULT('pending'),
        FOREIGN KEY(staff) REFERENCES staff(staffID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating Events table", error);
    
    }
};

export const createEventUsersTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS event_users(
        id VARCHAR(300) NOT NULL PRIMARY KEY,
        userID VARCHAR(300) NOT NULL,
        eventID VARCHAR(300) NOT NULL,
        joinedAt DATE NOT NULL,
        FOREIGN KEY(userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY(eventID) REFERENCES events(eventID) ON DELETE CASCADE
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating event users table", error);
    }
};