import passport from "passport";
import {Strategy} from 'passport-google-oauth20';
import { config } from "./env.js";
import { findUserByID, signUpUser } from "../users/users.services.js";

export const passposrtConfig = passport.use(new Strategy({

    clientID: config.googleClientID,
    clientSecret: config.googleCliendSecret,
    callbackURL: config.callBackUR

}, async (accessToken, refreshToken, profile, done) => {
    try {

        const userExists = await findUserByID(profile.id);

        if(userExists.rows.length > 0) return done(null, userExists.rows[0]);

        const id = profile.id;
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        const newUser = await signUpUser(id, email, name);

        return done(null, newUser.rows[0]);
        
    } catch (error) {
        console.log("Google error", error);
        return done(error, null);

    }
}));