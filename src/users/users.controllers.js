import { aToken, rToken } from "../tokens/jwt.js";
import { alterOtp, alterUserTokens, deleteOTP, findOtpByEmail, findRefreshTokenByUser, saveOtp, saveUserRefreshToken } from "../tokens/tokens.services.js";
import { comaparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendOtp } from "../utils/email.js";
import { generateOtp } from "../utils/otp.js";
import { uniqueID } from "../utils/uuid.js";
import { loginUserSchema, signUpUserSchema, validateUserOtpSchema } from "../validators/users.js";
import { findUserByEmail, signUpUser } from "./users.services.js";


export const signUpUserController = async (req, res) => {
    try {

        const {error, value} = signUpUserSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: error.message
            })
        };

        const {email} = value;

        const user = await findUserByEmail(email);

        if(user.rows.length > 0){
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
                Message: "Kindly verify your email by inputing the OTP sent to your provided email."
            });
        
        };

        await saveOtp(email, hashedOtp);

        await sendOtp(email, otp);

        return res.status(201).json({
            Message: "Kindly verify your email by inputing the OTP sent to your provided email."
        });
        
    } catch (error) {
        console.log("Error generating OTP for validation", error);

        return res.status(500).json({
            Error: "Error generating OTP for validation"
        })
        
    }
};

export const validateUserOtpController = async (req, res) => {
    try {

        const {error, value} = validateUserOtpSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {otp, email, name} = value;

        const userOtp = await findOtpByEmail(email);

        const isMatch = await comaparePassword(otp.toString(), userOtp.rows[0].password);
        
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials, or OTP"
            })
        };

        await signUpUser(uniqueID, email, name);

        await deleteOTP(email);

        return res.status(201).json({
            Message: "Account created successfully!"
        });

    } catch (error) {

        console.log("Error logging", error);
        
        return res.status(400).json({
            Error: "Error logging in."
        });
        
    }
};

export const loginUserController = async (req, res) => {
    try {

        const {error, value} = loginUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {email} = value;

        const user = await findUserByEmail(email);
        
        if(user.rows.length === 0) {

            return res.status(404).json({
                Error: "User not found. Kindly create an account to login."
            })

        };

        const loggedIn = await findRefreshTokenByUser(user.rows[0].userid);

        const accessToken = aToken({id: user.rows[0].userid, name: user.rows[0].name, role: 'customer'});

        const refreshToken = rToken({id: user.rows[0].userid, name: user.rows[0].name, role: 'customer'});

        const hashedToken = await hashPassword(refreshToken);

        if (loggedIn.rows.length > 0) {
            await alterUserTokens(user.rows[0].userid, refreshToken);

            return res.status(201).json({
                Message: "User logged in successfully!",
                accessToken, refreshToken
            });
        };

        await saveUserRefreshToken(user.rows[0].userid, hashedToken)

        return res.status(201).json({
            Message: "User logged in successfully!",
            accessToken, refreshToken
        });
        
    } catch (error) {

        console.log("Error logging", error);
        
        return res.status(400).json({
            Error: "Error logging in."
        });
        
    }
};