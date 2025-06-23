import { config } from "../config/env.js";
import { userPassposrtConfig } from "../config/passport.js";
import { aToken, rToken } from "../tokens/jwt.js";
import { comaparePassword, hashPassword } from "../utils/bcrypt.js";
import { generateAlphanumericId } from "../utils/uuid.js";
import { loginUserSchema, signUpUserSchema } from "../validators/users.js";
import { findUserByEmail, signUpUser } from "./users.services.js";


export const signUpUserController = async (req, res) => {
    try {

       const {error, value} = signUpUserSchema.validate(req.body);

       if(error) return res.status(400).json({Error: error.message});

       const {email, name, password} = value;

       let user = await findUserByEmail(email);

       if (user.rows.length > 0) return res.status(400).json({Error: "User exists already."});

       const hashedPassword = await hashPassword(password);

       const ID = await generateAlphanumericId("users", "userID");

       await signUpUser(ID, email, name, hashedPassword);      

        return res.status(201).json({
            Message: "Account created successfully!"
        });
        
    } catch (error) {

        console.error("Error signingUpUser", error);

        return res.status(500).json({error: "Internal server error; signing up user."})
        
    }
};

export const loginUserController = async (req, res) => {
    try {
        
        const { error, value } = loginUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ Error: error.message });
        }
        const { email, password } = value;
        const user = await findUserByEmail(email);

        if (user.rows.length === 0) return res.status(404).json({Error: "User not found. Kindly create an account to login."});

        const isMatch = await comaparePassword(password, user.rows[0].password);

        if(!isMatch) return res.status(401).json({Error: "Invalid credentials."});

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

export const loginUserWithGoogleController = userPassposrtConfig.authenticate('google', {scope: ['profile', 'email']});

export const loginUserWithGoogleCallback = userPassposrtConfig.authenticate('google', {session: false, failureRedirect: '/login'});

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