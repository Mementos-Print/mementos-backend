import { config } from "../config/env.js";
import { aToken, rToken } from "../tokens/jwt.js";
import { comaparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendOtp } from "../utils/email.js";
import { generateOtp } from "../utils/otp.js";
import { uniqueID } from "../utils/uuid.js";
import { forgotPasswordSchema, loginStaffSchema, signUpStaffSchema, updateStaffRoleSchema, verifyStaffPasswordOtpSchema } from "../validators/staff.js";
import { findStaffByEmail, resetStaffPassword, signUpStaff, updateStaffRole } from "./staff.services.js";


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
            Message: "Account created successfully."
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
        const { error, value } = loginStaffSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ Error: error.message });
        }

        const { email, password } = value;

        const staff = await findStaffByEmail(email);

        if (staff.rows.length === 0) {
            return res.status(404).json({
                Error: "Account not found. Kindly create an account to login.",
            });
        };

        const isMatch = await comaparePassword(password, staff.rows[0].password);

        if(!isMatch) {
            return res.status(401).json({
                Error: "Invalid credentials!"
            })
        };

        const staffId = staff.rows[0].staffid;
        const staffName = staff.rows[0].name;
        const staffRole = staff.rows[0].role;

        const accessToken = aToken({ id: staffId, name: staffName, role: staffRole });

        const refreshToken = rToken({ id: staffId, name: staffName, role: staffRole });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true, // Prevents JavaScript access
        //     secure: config.nodeEnv === "production", // Ensures HTTPS-only (set false for local dev)
        //     sameSite: config.nodeEnv === "production" ? "None" : "Lax", // Required for cross-origin requests
        //     path: "/",
        //     maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
        // });

        const cookieOptions = {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 6 * 30 * 24 * 60 * 60 * 1000
        };
        
        console.log("Cookie options:", cookieOptions);
        
        res.cookie("refreshToken", refreshToken, cookieOptions);        

        return res.status(201).json({
            Message: "Staff logged in successfully!",
            accessToken
        });
    } catch (error) {
        console.log("Error logging in:", error);
        return res.status(500).json({ Error: "Internal Server Error" });
    }
};

export const generateResetPasswordOtpController = async (req, res) => {
    try {

        const {error, value} = forgotPasswordSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: error.message
            })
        };

        const {email} = value;

        const staffExists = await findStaffByEmail(email);

        if(staffExists.rows.length === 0) {
            return res.status(404).json({
                Error: "Account doesn't exist!"
            });
        };

        const otp = generateOtp;

        const hashedOtp = await hashPassword(otp);

        await sendOtp(email, otp);

        await resetStaffPassword(hashedOtp, email);

        return res.status(200).json({
            message: "Verif OTP sent to mail to reset password"
        });
        
    } catch (error) {

        console.error("Error resetting password", error);
        
        return res.status(500).json({
            Message: "Error resetting password"
        })
        
    }
};

export const verifyResetPasswordOtpController = async (req, res) => {
    try {

        const {error, value} = verifyStaffPasswordOtpSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: error.message
            })
        };

        const {otp, email, newPassword} = value;

        const staff = await findStaffByEmail(email);

        const isMatch = await comaparePassword(otp.toString(), staff.rows[0].password);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid OTP"
            })
        };

        const hashedPassword = await hashPassword(newPassword);

        await resetStaffPassword(hashedPassword, email);

        return res.status(201).json({
            message: "Password reset successfully"
        });
        
    } catch (error) {

        console.error("Error verifying OTP and resetting password", error);
        
        return res.status(500).json({
            Error: "Error verifying OTP and resetting password"
        });
        
    }
};

export const updateStaffRoleController = async (req, res) => {
    try {

        const admin = req.user;

        if(!admin){
            return res.status(401).json({
                Error: "Unauthorized"
            })
        };

        const {error, value} = updateStaffRoleSchema.validate(req.body);

        if(error){
            return res.status(400).json({
                Error: error.message
            })
        };

        const {email, role} = value;

        const staffExists = await findStaffByEmail(email);

        if(staffExists.rows.length === 0) {
            return res.status(404).json({
                Error: "Staff not found"
            })
        };

        await updateStaffRole(role, email);

        return res.status(200).json({
            Message: "Staff role updated successfully"
        });
        
    } catch (error) {

        console.error("Error updating staff role", error);
        
        return res.status(500).json({
            Error: "Error updating staff role"
        });
        
    }
}