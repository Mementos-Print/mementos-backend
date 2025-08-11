import randomstring from "randomstring";
import { getEventsByID } from "../events/events.services.js";

export const generateOtp = randomstring.generate({
    length: 6,
    charset: 'numeric'
});

export const generateEventCode = async (tableName, tableID) => {
    let unique = false;
    let eventCode;

    while(!unique) {

        eventCode = randomstring.generate({
        length: 6,
        charset: 'alphabetic'
        });

        const codeExists = await getEventsByID(tableName, tableID, eventCode);

        if (codeExists.rows.length === 0) unique = true;

    }
    return eventCode;
};