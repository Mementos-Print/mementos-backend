import { executeQuery } from "../config/database.js";


export const createEvent = async(eventID, title, type, staff, date) => {
    try {

        const query = `
        INSERT INTO events(eventID, title, theme, staff, date)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *;
        `;

        const values = [eventID, title, type, staff, date];

        const result = await executeQuery(query, values);

        return result.rows;
        
    } catch (error) {
        console.error("Error inserting into events table", error);
    }
};

export const getEvents = async () => {
    try {

        const query = `
        SELECT * from events;
        `;

        const result = await executeQuery(query, []);

        return result.rows;
        
    } catch (error) {
        console.error("Error selecting from events and custom_borders table", error);
    }
};

export const getEventsByID = async (tableName, tableID, eventID) => {
    try {

        const query = `
        SELECT * FROM ${tableName} WHERE ${tableID} = $1;
        `;

        const result = await executeQuery(query, [eventID]);

        return result.rows;
        
    } catch (error) {
        console.error(`Error selecting from ${tableName} table`, error);
    }
};

export const deleteEvent = async (eventIDs) => {
    try {

        const query = `
        DELETE FROM events WHERE eventID = ANY($1);
        `;

        await executeQuery(query, [eventIDs]);
        
    } catch (error) {
        console.error("Error deleting from events table", error);
    }
};

export const getEventUsers = async (userID, eventID) => {
    try {

        const query = `
        SELECT * FROM event_users WHERE userID = $1 AND eventID = $2;
        `;

        const result = await executeQuery(query, [userID, eventID]);

        return result;
        
    } catch (error) {
        console.error("Error selecting from events table", error);
    }
};

export const joinEvent = async (ID, userID, eventID) => {
    try {

        const query = `
        INSERT INTO event_users(ID, userID, eventID)
        VALUES($1, $2, $3);
        `;

        const values = [ID, userID, eventID];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into events_users table", error);
    }
}