import { config } from "../config/env.js";
import { passposrtConfig } from "../config/passport.js";
import { aToken, rToken } from "../tokens/jwt.js";
import { generateAlphanumericId } from "../utils/uuid.js";
import { loginUserSchema } from "../validators/users.js";
import { findUserByEmail, signUpUser } from "./users.services.js";


export const loginUserController = async (req, res) => {
    try {
        
        const { error, value } = loginUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ Error: error.message });
        }
        const { email, name } = value;
        let user = await findUserByEmail(email);
        const ID = await generateAlphanumericId();

        if (user.rows.length === 0) {
            await signUpUser(ID, email, name);
            user = await findUserByEmail(email);
        }

        const userId = user.rows[0].userid;
        const userName = user.rows[0].name;
        const userRole = user.rows[0].role;

        const accessToken = aToken({ id: userId, name: userName, role: userRole });
        const refreshToken = rToken({ id: userId, name: userName, role: userRole });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true, // Prevents JavaScript access
        //     secure: config.nodeEnv === "production", // Ensures HTTPS-only (set false for local dev)
        //     sameSite: config.nodeEnv === "production" ? "None" : "Lax", // Required for cross-origin requests
        //     path: "/",
        //     maxAge: 6 * 30 * 24 * 60 * 60 * 1000 // 6 months
        // });

        const cookieOptions = {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 6 * 30 * 24 * 60 * 60 * 1000
        };
        
        res.cookie("refreshToken", refreshToken, cookieOptions);        

        return res.status(user.rows.length === 0 ? 201 : 200).json({
            Message: "User logged in successfully!",
            accessToken
        });

    } catch (error) {
        console.log("Error logging in:", error);
        return res.status(500).json({ Error: "Internal Server Error" });
    }
};

export const loginUserWithGoogleController = passposrtConfig.authenticate('google', {scope: ['profile', 'email']});

export const loginUserWithGoogleCallback = passposrtConfig.authenticate('google', {session: false, failureRedirect: '/login'});

export const loginUserWithGoogleCallbackController = (req, res) => {

    try {
        const accessToken = aToken({id: req.user.userid, name: req.user.name, role: req.user.role});
    const refreshToken = aToken({id: req.user.userid, name: req.user.name, role: req.user.role});

    const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: config.nodeEnv === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000
    };
    
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
        Message: "User logged in successfully!",
        accessToken
    });
    } catch (error) {
        console.log("Error logging in user with google", error);
        return res.status(500).json({Message: "Error logging in user with google"});
    }

};