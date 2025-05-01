import { executeQuery } from "../config/database.js";


export const signUpUser = async(userID, email, name) => {
    try {

        const query = `
        INSERT INTO users(userID, email, name)
        VALUES($1,$2,$3)
        RETURNING *;
        `;

        const values = [userID, email, name];

        const result = await executeQuery(query, values);

        return result;
        
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

export const findUserByEmailOrID = async(email, ID) => {
    try {

        const query = `
        SELECT * FROM users WHERE email = $1 OR userID= $2;
        `;

        const values = [email, ID];

        const results = await executeQuery(query, values);

        return results;
        
    } catch (error) {
        console.error("Error finding user by ID", error);
    }
};