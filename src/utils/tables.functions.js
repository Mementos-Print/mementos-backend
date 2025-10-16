import { createImagesTable, createUserMementoVTable } from "../images/images.models.js";
import { createStaffTable } from "../staff/staff.models.js";
import {  createUserTable } from "../users/users.models.js";
import { createEventsTable, createEventUsersTable } from "../events/events.models.js";
import { createCustomBordeTable, createEventsImagesTable, createEventUserMementoVTable } from "../event_images/event_images.models.js";


export const tables = async() => {

    await createUserTable();
    await createImagesTable();
    await createStaffTable();
    await createEventsTable();
    await createEventsImagesTable();
    await createCustomBordeTable();
    await createEventUsersTable();
    await createEventUserMementoVTable();
    await createUserMementoVTable();

};