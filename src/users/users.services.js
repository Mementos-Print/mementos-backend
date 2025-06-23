import { executeQuery } from "../config/database.js";


export const signUpUser = async(userID, email, name, password) => {
    try {

        const query = `
        INSERT INTO users(userID, email, name, password)
        VALUES($1,$2,$3, $4);
        `;

        const values = [userID, email, name, password];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into users table", error);
    }

};

export const findUserByEmail = async(email) => {
    try {

        const query = `
        SELECT * FROM users WHERE email = $1;
        `;

        const values = [email];

        const results = await executeQuery(query, values);

        return results;
        
    } catch (error) {
        console.error("Error finding user by email", error);
    }
};

export const findUserOrStaffByEmailOrID = async(tableName, staffOrUserID, email, ID) => {
    try {

        const query = `
        SELECT * FROM ${tableName} WHERE email = $1 OR ${staffOrUserID}= $2;
        `;

        const values = [email, ID];

        const results = await executeQuery(query, values);

        return results;
        
    } catch (error) {
        console.error("Error finding user by ID", error);
    }
};