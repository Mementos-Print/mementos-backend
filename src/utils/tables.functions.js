import { createImagesTable } from "../images/images.models.js";
import {  createUserTable } from "../users/users.models.js";


export const tables = async() => {

    await createUserTable();
    await createImagesTable();

};