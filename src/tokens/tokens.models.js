import { executeQuery } from "../config/database.js";


export const createUserTokensTable = async() => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS usertokens(
        userr VARCHAR(300) UNIQUE NOT NULL,
        tokens VARCHAR(300) NOT NULL,
        FOREIGN KEY(userr) REFERENCES users(userID)
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating user tokens table", error);
    }
};

export const createStaffTokensTable = async() => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS stafftokens(
        staff VARCHAR(300) UNIQUE NOT NULL,
        tokens VARCHAR(300) NOT NULL,
        FOREIGN KEY(staff) REFERENCES staff(staffID)
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating staff tokens table", error);
    }
};