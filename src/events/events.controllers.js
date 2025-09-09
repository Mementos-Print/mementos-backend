import { processEventBorderController } from "../event_images/event_images.controllers.js";
import { getCustomBorder } from "../event_images/event_images.services.js";
import { generateEventCode } from "../utils/otp.js";
import { createEventSchema, updateEventSchema } from "../validators/events.js";
import { createEvent, deleteEvent, getEventsByID, getEventUsers, joinEvent, updateEvent } from "./events.services.js";


export const createEventController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) return res.status(401).json({Error: "Unauthorized"});

        const {error, value} = createEventSchema.validate(req.body);

        if (error) return res.status(400).json({Error: error.message});

        const file = req.files;
        
        const {title, date} = value;

        const eventCode = await generateEventCode('events', 'eventID');
        
        const staff = loggedInStaff.id;

        const event = await createEvent(eventCode, title, staff, date);

        let border;

        if(file.length > 0) {

            border = await processEventBorderController(file, eventCode);

            return res.status(201).json({
            Message: "Event created successfully:",
            event: event.rows, 
            custom_border: border[0].secure_url
        })

        };

        return res.status(201).json({
            Message: "Event created successfully:",
            event: event.rows
        });
        
    } catch (error) {

        console.error("Error creating event", error);

        return res.status(500).json({Error: "Internal Server Error"});
        
    }
};

export const updateEventController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) return res.status(401).json({Error: "Unauthorized"});

        const {eventCode} = req.params;
        const {error, value} = updateEventSchema.validate(req.body);

        if (error) return res.status(400).json({Error: error.message});
        
        const {title, date} = value;
        const file = req.files;
        const staffCreatedEvent = await getEventsByID('events', 'eventID', eventCode);

        if(!eventCode) return res.status(400).json({Error: "Event code is required"});

        if(staffCreatedEvent.rows[0].staff !== loggedInStaff.id || staffCreatedEvent.rows.length === 0) return res.status(401).json({Error: "Unauthorized"});

        const updatedEvent = await updateEvent(title, date, eventCode);

        if(file) await processEventBorderController(file, eventCode);

        return res.status(200).json({
            Message: "Event updated successfully",
            details: updatedEvent.rows[0]
        });
        
    } catch (error) {

        console.error("Error editing event", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};

export const viewEventsController = async (req, res) => {
    try {

        const loggedIn = req.user;

        if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

        const eventCode = req.query.eventCode;

        if(eventCode) {
            const availableEvents = await getEventsByID("events", "eventID", eventCode);

            return res.status(200).json({events: availableEvents.rows});
        };

        const availableEvents = await getEventsByID('events', 'staff', loggedIn.id);

        return res.status(200).json({events: availableEvents.rows});
        
    } catch (error) {

        console.error("Error viewing events", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};

export const deleteEventController = async (req, res) => {
    try {

        const loggedIn = req.user;

        if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

        const eventCode = req.query.eventCode;

        if(!eventCode) return res.status(400).json({Error: "Event code is required"});

        const eventExists = await getEventsByID('events', 'eventID', eventCode);

        if (eventExists.rows.length === 0) return res.status(404).json({Error: "Event not found. Kindly check the event code and try again"});

        if(loggedIn.id !== eventExists.rows[0].staff) return res.status(401).json({Error: "You are not authorized to peeform this action"});

        await deleteEvent(eventCode);

        return res.status(200).json({Message: "Event deleted successfully"});
        
    } catch (error) {

        console.error("Error deleting event", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};

export const joinEventsController = async (req, res) => {
    try {

        const loggedIn = req.user;

        if(!loggedIn) return res.status(401).json({Error: "Unauthorized"});

        const eventCode = req.query.eventCode;

        if(!eventCode) return res.status(400).json({error: "event code is required"});

        const eventExists = await getEventsByID('events', 'eventID', eventCode);
        
        if(eventExists.rows.length === 0) return res.status(404).json({Error: "Event not found. Check the code and try again."});

        const customBorder = await getCustomBorder(eventCode);

        const alreadyJoinedEvent = await getEventUsers(loggedIn.id, eventCode);

        if (alreadyJoinedEvent.rows.length === 0) {

            const id = await generateEventCode('event_users', 'id');

            await joinEvent(id, loggedIn.id, eventCode);

        };

        if (customBorder.rows.length > 0) {
            return res.status(200).json({
                event: eventExists.rows[0],
                customBorder: customBorder.rows[0].url
            });
        };

        return res.status(200).json({event: eventExists.rows[0]});
        
    } catch (error) {

        console.error("Error joing event", error);
        
        return res.status(500).json({Error: "Internal server error"});
        
    }
};