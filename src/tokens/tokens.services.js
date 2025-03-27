import { executeQuery } from "../config/database.js";


export const saveStaffRefreshToken = async(staff, token) => {
    try {

        const query = `
        INSERT INTO stafftokens(staff, tokens)
        VALUES($1, $2);
        `;

        const values = [staff, token];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into tokens table", error);
    }
};

export const saveUserRefreshToken = async(user, token) => {
    try {

        const query = `
        INSERT INTO usertokens(userr, tokens)
        VALUES($1, $2);
        `;

        const values = [user, token];

        await executeQuery(query, values);
        
    } catch (error) {
        console.error("Error inserting into tokens table", error);
    }
};

export const findRefreshTokenByUser = async(user) => {
    try {

        const query = `
        SELECT * FROM usertokens WHERE userr = $1;
        `;

        const values = [user];

        const result = await executeQuery(query, values);

        return result;
        
    } catch (error) {
        console.error("Error fetching from user tokens table", error);
    }
};

export const findRefreshTokenByStaff = async(user) => {
    try {

        const query = `
        SELECT * FROM stafftokens WHERE staff = $1;
        `;

        const values = [user];

        const result = await executeQuery(query, values);

        return result;
        
    } catch (error) {
        console.error("Error fetching from staff tokens table", error);
    }
};

export const logoutStaff = async(staff) => {
    try {

        const query = `
        DELETE FROM stafftokens WHERE staff = $1;
        `;

        const value = [staff];

        await executeQuery(query, value);
        
    } catch (error) {
        console.error("Error deleting from staff tokens table", error);
    }
};

export const logoutUser = async(user) => {
    try {

        const query = `
        DELETE FROM usertokens WHERE userr = $1;
        `;

        const value = [user];

        await executeQuery(query, value);
        
    } catch (error) {
        console.error("Error deleting from staff tokens table", error);
    }
};

export const alterStaffTokens = async(staff, token) => {
    try {

        const query = `
        UPDATE stafftokens SET tokens = $1
        WHERE staff = $2;
        `;

        await executeQuery(query, [staff, token]);
        
    } catch (error) {
        console.error("Error altering staff token", error);
    }
};

export const alterUserTokens = async(user, token) => {
    try {

        const query = `
        UPDATE usertokens SET tokens = $1
        WHERE userr = $2;
        `;

        await executeQuery(query, [user, token]);
        
    } catch (error) {
        console.error("Error altering staff token", error);
    }
};

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