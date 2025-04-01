import { executeQuery } from "../config/database.js";


export const createOtpTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS otp(
        email VARCHAR(300) UNIQUE NOT NULL,
        password VARCHAR(300) NOT NULL
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating OTP table");
    }
};