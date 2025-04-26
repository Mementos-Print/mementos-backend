import { executeQuery } from "../config/database.js";

export const createUserTable = async() => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS users(
        userID VARCHAR(300) NOT NULL PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT('customer'),
        password VARCHAR(300) DEFAULT('no)
        );
        `;

        await executeQuery(query, []);
        
    } catch (error) {
        console.error("Error creating user table", error);
    }
};