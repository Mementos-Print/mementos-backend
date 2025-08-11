import { executeQuery } from "../config/database.js";


export const createEvent = async(eventID, title, staff, date) => {
    try {

        const query = `
        INSERT INTO events(eventID, title, staff, event_date)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `;

        const values = [eventID, title, staff, date];

        const result = await executeQuery(query, values);

        return result;
        
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

        return result;
        
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

        return result;
        
    } catch (error) {
        console.error(`Error selecting from ${tableName} table`, error);
    }
};

export const updateEvent = async (title, date, eventCode) => {
    try {

        const query = `
        UPDATE events SET
        title = COALESCE($1, title),
        event_date = COALESCE($2, event_date)
        WHERE eventID = $3
        RETURNING *;
        `;

        const values = [title, date, eventCode];

        const result = await executeQuery(query, values);

        return result;
        
    } catch (error) {
        console.error("Error updating events table");
    }
};

export const deleteEvent = async (eventIDs) => {
    try {

        const query = `
        DELETE FROM events WHERE eventID = $1;
        `;

        await executeQuery(query, [eventIDs]);
        
    } catch (error) {
        console.error("Error deleting from events table", error);
    }
};