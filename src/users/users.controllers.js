import passport from "passport";
import { config } from "../config/env.js";
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
            return res.status(400).json({ error: error.message });
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

        const cookieOptions = {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 6 * 30 * 24 * 60 * 60 * 1000
        };
        
        res.cookie("userRefreshToken", refreshToken, cookieOptions);        

        return res.status(user.rows.length === 0 ? 201 : 200).json({
            Message: "User logged in successfully!",
            accessToken,
            userName
        });

    } catch (error) {
        console.log("Error logging in:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const loginUserWithGoogleController = passport.authenticate('google-user', {scope: ['profile', 'email'], session: false});

export const loginUserWithGoogleCallback = passport.authenticate('google-user', {session: false, failureRedirect: '/login'});

export const loginUserWithGoogleCallbackController = (req, res) => {

    try {
        const accessToken = aToken({id: req.user.userid, name: req.user.name, role: req.user.role});
    const refreshToken = rToken({id: req.user.userid, name: req.user.name, role: req.user.role});

    const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: config.nodeEnv === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000
    };
    
    res.cookie("userRefreshToken", refreshToken, cookieOptions);

    const redirectURL = `${config.frontendURI}?accessToken=${accessToken}&name=${encodeURIComponent(req.user.name)}`;

    return res.redirect(redirectURL);

    // return res.status(200).json({
    //     Message: "User logged in successfully!",
    //     accessToken,
    //     name: req.user.name
    // });
    } catch (error) {
        console.log("Error logging in user with google", error);
        return res.status(500).json({Message: "Error logging in user with google"});
    }

};