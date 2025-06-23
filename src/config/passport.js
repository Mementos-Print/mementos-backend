import passport from "passport";
import {Strategy} from 'passport-google-oauth20';
import { config } from "./env.js";
import { findUserOrStaffByEmailOrID, signUpUser } from "../users/users.services.js";
import { signUpStaff } from "../staff/staff.services.js";

export const userPassposrtConfig = passport.use(new Strategy({

    clientID: config.googleClientID,
    clientSecret: config.googleCliendSecret,
    callbackURL: config.callBackUR

}, async (accessToken, refreshToken, profile, done) => {
    try {

        const id = profile.id;
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        const userExists = await findUserOrStaffByEmailOrID("users", "userID", email, id);

        if(userExists.rows.length > 0) return done(null, userExists.rows[0]);

        const newUser = await signUpUser(id, email, name, null);

        return done(null, newUser.rows[0]);
        
    } catch (error) {
        console.log("Google error", error);
        return done(error, null);

    }
}));

export const staffPassposrtConfig = passport.use(new Strategy({

    clientID: config.googleClientID,
    clientSecret: config.googleCliendSecret,
    callbackURL: config.callBackUR

}, async (accessToken, refreshToken, profile, done) => {
    try {

        const id = profile.id;
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        const staffExists = await findUserOrStaffByEmailOrID("staff", "staffID", email, id);

        if(staffExists.rows.length > 0) return done(null, staffExists.rows[0]);

        const newStaff = await signUpStaff(id, email, name, null);

        return done(null, newStaff.rows[0]);
        
    } catch (error) {
        console.log("Google error", error);
        return done(error, null);

    }
}));