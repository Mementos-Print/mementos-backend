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