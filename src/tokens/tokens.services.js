import { executeQuery } from "../config/database.js";


export const saveOtp = async (email, otp) => {
    try {

        const query = `
        INSERT INTO otp(email, password)
        VALUES($1, $2);
        `;

        await executeQuery(query, [email, otp]);
        
    } catch (error) {
        console.error("Error inserting into otp table", error);
    }
};

export const deleteOTP = async(email) => {
    try {

        const query = `
        DELETE FROM otp WHERE email = $1;
        `;

        await executeQuery(query, [email])
        
    } catch (error) {
        console.error("error deleting from OTP table", error);
    }
};

export const alterOtp = async (otp, email) => {
    try {

        const query = `
        UPDATE otp SET password = $1 WHERE email = $2;
        `;

        await executeQuery(query, [otp, email]);
        
    } catch (error) {
        console.error("Error updating otp table", error);
    }
};

export const findOtpByEmail = async (email) => {
    try {

        const query = `
        SELECT * FROM otp WHERE email = $1;
        `;

        const result = await executeQuery(query, [email]);

        return result;
        
    } catch (error) {
        console.error("Error ffetching from otp table", error);
    }
};