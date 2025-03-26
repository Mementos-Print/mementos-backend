import { executeQuery } from "../config/database.js";


export const createStaffTable = async() => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS staff(
        staffID VARCHAR(300) NOT NULL PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(300) NOT NULL,
        role VARCHAR(50) DEFAULT('staff')
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating user table", error);
    }
};


