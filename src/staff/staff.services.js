import { executeQuery } from "../config/database.js";

export const signUpStaff = async(staffID, email, name, password) => {
    try {

        const query = `
        INSERT INTO staff(staffID, email, name, password)
        VALUES($1,$2,$3,$4)
        RETURNING *;
        `;

        const values = [staffID, email, name, password];

        const result = await executeQuery(query, values);

        return result;
        
    } catch (error) {
        console.error("Error inserting into staff table", error);
    }

};

export const findStaffByEmail = async(email) => {
    try {

        const query = `
        SELECT * FROM staff WHERE email = $1;
        `;

        const values = [email];

        const results = await executeQuery(query, values);

        return results;
        
    } catch (error) {
        console.error("Error finding staff", error);
    }
};

export const resetStaffPassword = async(password, email) => {
    try {

        const query = `
        UPDATE users
        SET password = $1
        WHERE email = $2
        `;

        const value = [password, email];

        await executeQuery(query, value);
        
    } catch (error) {
        console.log("Error updating staff table", error);
    }
};

export const updateStaffRole = async(role, email) => {
    try {

        const query = `
        UPDATE users
        SET role = $1
        WHERE email = $2
        `;

        const values = [role, email];

        await executeQuery(query, values);
        
    } catch (error) {
        console.log("Error updating staff role", error);
    }
};