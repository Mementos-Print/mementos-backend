import { processEventBorderController } from "../event_images/event_images.controllers.js";
import { generateEventCode } from "../utils/otp.js";
import { createEventSchema, joinEventSchema } from "../validators/events.js";
import { createEvent, getEvents, getEventsByID, getEventUsers, joinEvent } from "./events.services.js";


export const createEventController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) return res.status(401).json({Error: "Unauthorized"});

        const {error, value} = createEventSchema.validate(req.body);

        if (error) return res.status(400).json({Error: error.message});

        const files = req.files;
        
        const {title, theme, date} = value;

        const eventCode = await generateEventCode('events', 'eventID');
        
        const staff = loggedInStaff.id;

        const event = await createEvent(eventCode, title, theme, staff, date);

        await processEventBorderController(files, eventCode);

        return res.status(201).json({Message: "Event created successfully:", event});
        
    } catch (error) {

        console.error("Error creating event", error);

        return res.status(500).json({Error: "Internal Server Error"});
        
    }
};

export const viewEventsController = async (req, res) => {
    try {

        const loggedIn = req.user;

        if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

        const availableEvents = await getEvents();

        return res.status(200).json({availableEvents});
        
    } catch (error) {

        console.error("Error viewing events", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};

export const joinEventsController = async (req, res) => {
    try {

        const loggedIn = req.user;

        if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

        const {error, value} = joinEventSchema.validate(req.body);

        if(error) return res.status(400).json({Error: error.message});

        const {eventCode} = value;

        const eventExists = await getEventsByID('events', 'eventID', eventCode);

        if(eventExists.length === 0) return res.status(404).json({Error: "Event not found. Check the code and try again."});

        const alreadyJoinedEvent = await getEventUsers(loggedIn.id, eventCode);

        const id = await generateEventCode('event_users', 'id');

        if (alreadyJoinedEvent.rows.length === 0) await joinEvent(id, loggedIn.id, eventCode);

        return res.status(200).json({event: eventExists});
        
    } catch (error) {

        console.error("Error joing event", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};