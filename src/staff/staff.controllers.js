import { aToken, rToken } from "../tokens/jwt.js";
import { alterStaffTokens, findRefreshTokenByStaff, saveStaffRefreshToken } from "../tokens/tokens.services.js";
import { comaparePassword, hashPassword } from "../utils/bcrypt.js";
import { uniqueID } from "../utils/uuid.js";
import { loginStaffSchema, signUpStaffSchema } from "../validators/staff.js";
import { findStaffByEmail, signUpStaff } from "./staff.services.js";


export const signUpStaffController = async(req, res) => {
    try {

        const {error, value} = signUpStaffSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {email, name, password} = value;

        const staff = await findStaffByEmail(email);

        if (staff.rows.length > 0) {
            return res.status(400).json({
                Message: "Account already exists."
            });
        };

        const hashedPassword = await hashPassword(password);

        await signUpStaff(uniqueID, email, name, hashedPassword);

        return res.status(201).json({
            Message: "Account created successfully!"
        });
        
    } catch (error) {

        console.error("Error signing up staff", error);
        
        return res.status(400).json({
            Error: "Error signing up staff."
        })
        
    }
};

export const loginStaffController = async (req, res) => {
    try {

        const {error, value} = loginStaffSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {email, password} = value;

        const staff = await findStaffByEmail(email);

        if (staff.rows.length == 0) {
            return res.status(404).json({
                Error: "Account doesn't exist. Kindly create an account to login."
            });
        };

        const staffDetails = staff.rows[0];

        const passwordMatch = await comaparePassword(password, staffDetails.password);

        if(!passwordMatch) {
            return res.status(400).json({
                Error: "Invalid credentials"
            });
        };

        const loggedIn = await findRefreshTokenByStaff(staffDetails.staffid);

        const accessToken = aToken({id: staffDetails.staffid, role: staffDetails.role});

        const refreshToken = rToken({id: staffDetails.staffid, role: staffDetails.role});

        const hashedToken = await hashPassword(refreshToken);

        if (loggedIn.rows.length > 0) {
            await alterStaffTokens(staffDetails.staffid, refreshToken);

            return res.status(201).json({
                Message: "Satff logged in successfully!",
                accessToken, refreshToken
            });
        };
 
        await saveStaffRefreshToken(staffDetails.staffid, hashedToken);

        return res.status(201).json({
            Message: "Satff logged in successfully!",
            accessToken, refreshToken
        });
        
    } catch (error) {

        console.log("Error logging", error);
        
        return res.status(400).json({
            Error: "Error logging in."
        });
        
    }
};