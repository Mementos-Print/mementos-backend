import { createImagesTable } from "../images/images.models.js";
import { createStaffTable } from "../staff/staff.models.js";
import { createOtpTable, createStaffTokensTable, createUserTokensTable } from "../tokens/tokens.models.js";
import {  createUserTable } from "../users/users.models.js";


export const tables = async() => {

    await createUserTable();
    await createImagesTable()
    await createStaffTable();
    await createStaffTokensTable();
    await createUserTokensTable();
    await createOtpTable();

};