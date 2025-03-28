import { aToken, rToken } from "../tokens/jwt.js";
import { alterOtp, alterStaffTokens, deleteOTP, findOtpByEmail, findRefreshTokenByStaff, saveOtp, saveStaffRefreshToken } from "../tokens/tokens.services.js";
import { comaparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendOtp } from "../utils/email.js";
import { generateOtp } from "../utils/otp.js";
import { uniqueID } from "../utils/uuid.js";
import { loginStaffSchema, signUpStaffSchema, verifyStaffOtp, verifyStaffPasswordOtpSchema } from "../validators/staff.js";
import { findStaffByEmail, resetStaffPassword, signUpStaff } from "./staff.services.js";


export const signUpStaffController = async(req, res) => {
    try {

        const {error, value} = signUpStaffSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {email} = value;

        const staff = await findStaffByEmail(email);

        if (staff.rows.length > 0) {
            return res.status(400).json({
                Message: "Account already exists."
            });
        };

        const otp = generateOtp;

        const hashedOtp = await hashPassword(otp);

        const savedOtp = await findOtpByEmail(email);

        if(savedOtp.rows.length > 0) {

            await sendOtp(email, otp);

            await alterOtp(hashedOtp, email);

            return res.status(201).json({
                Message: "Kindly verifyy your email by inputing the OTP sent to your provided email."
            });

        };

        await saveOtp(email, hashedOtp);
        await sendOtp(email, otp);

        return res.status(201).json({
            Message: "Kindly verify your email by inputing the OTP sent to your provided email."
        });
        
    } catch (error) {

        console.error("Error signing up staff", error);
        
        return res.status(400).json({
            Error: "Error signing up staff."
        })
        
    }
};

export const verifySignupOtpController = async (req, res) => {
    try {

        const {error, value} = verifyStaffOtp.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: error.message
            })
        };

        const {otp, email, name, password} = value;

        const staffOtp = await findOtpByEmail(email);

        const isMatch = await comaparePassword(otp.toString(), staffOtp.rows[0].password);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials, or OTP"
            })
        };

        const hashedPassword = await hashPassword(password);

        await signUpStaff(uniqueID, email, name, hashedPassword);

        await deleteOTP(email);

        return res.status(200).json({
            message: "Staff signed up successfully!"
        });
        
    } catch (error) {

        console.log("Error verifying OTP and signing up staff", error);

        return res.status(500).json({
            error: "Error verifying OTP and signing up staff"
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

        if (staff.rows.length === 0) {
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

export const generateResetPasswordOtpController = async (req, res) => {
    try {

        const {error, value} = signUpStaffSchema.validate(req.body);

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
            message: "OTP successfully sent to mail"
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

        const {email, otp, newPassword} = value;

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