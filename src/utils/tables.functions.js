import { createImagesTable } from "../images/images.models.js";
import { createStaffTable } from "../staff/staff.models.js";
import {  createUserTable } from "../users/users.models.js";
import { createEventsTable, createEventsUsers } from "../events/events.models.js";
import { createCustomBordeTable, createEventsImagesTable } from "../event_images/event_images.models.js";


export const tables = async() => {

    await createUserTable();
    await createImagesTable();
    await createStaffTable();
    await createEventsTable();
    await createEventsImagesTable();
    await createEventsUsers();
    await createCustomBordeTable();

};