import { refreshTokenSchema } from "../validators/tokens.js";
import jwt from 'jsonwebtoken';
import { findRefreshTokenByStaff, findRefreshTokenByUser, logoutStaff, logoutUser } from "./tokens.services.js";
import { config } from "../config/env.js";
import { aToken } from "./jwt.js";


export const refershStaffTokenController = async(req, res) => {
    try {

        const {error, value} = refreshTokenSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {refreshToken} = value;

        const decodedToken = jwt.decode(refreshToken); 

        const tokenExists = await findRefreshTokenByStaff(decodedToken.id);

        if ( tokenExists.rows.length == 0) {
            return res.status(404).json({
                Error: "This session has expired. Kindly re-login"
            });
        };

        jwt.verify(refreshToken, config.rsecret, (error, user) => {

            if (error) {
                return res.status(403).json({
                    Error: "This session has expired. Kindly re-login"
                });
            };
            
            const newAccessToken = aToken({id: user.id, role: user.role});

            return res.status(200).json({
                AccessToken: newAccessToken
            });

        });
        
    } catch (error) {

        console.error("Error refreshing staff token", error);

        return res.status(400).json({
            Error: "Error refreshing staff token"
        });
    }
};

export const refershUserTokenController = async(req, res) => {
    try {

        const {error, value} = refreshTokenSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {refreshToken} = value;

        const decodedToken = jwt.decode(refreshToken); 

        const tokenExists = await findRefreshTokenByUser(decodedToken.id);

        if (tokenExists.rows.length == 0) {
            return res.status(404).json({
                Error: "This session has expired. Kindly re-login"
            });
        };

        jwt.verify(refreshToken, config.rsecret, (error, user) => {

            if (error) {
                return res.status(403).json({
                    Error: "This session has expired. Kindly re-login"
                });
            };
            
            const newAccessToken = aToken({id: user.id, role: user.role});

            return res.status(200).json({
                AccessToken: newAccessToken
            });

        });
        
    } catch (error) {

        console.error("Error refreshing token", error);

        return res.status(400).json({
            Error: "Error refreshing token"
        });
    }
};

export const logoutStaffController = async (req, res) => {
    try {

        const loggedInStaff = req.user;

        if(!loggedInStaff) {
            return res.status(401).json({
                Error: "Unauthorized"
            })
        };

        const loggedIn = await findRefreshTokenByStaff(loggedInStaff.id);

        if(loggedIn.rows.length == 0) {
            return res.status(403).json({
                Error: "This session has expired. Kindly re-login to continue."
            })
        };


        await logoutStaff(loggedInStaff.id);

        return res.status(200).json({
            Message: "User logged out successfully"
        });
        
    } catch (error) {

        console.error("Error logging out user", error);
        
        return res.status(400).json({
            Error: "Error logging out user"
        });

    }
};

export const logoutUserController = async (req, res) => {
    try {

        const loggedInUser = req.user;

        if(!loggedInUser) {
            return res.status(401).json({
                Error: "Unauthorized"
            })
        };

        const loggedIn = await findRefreshTokenByUser(loggedInUser.id);

        if(loggedIn.rows.length == 0) {
            return res.status(403).json({
                Error: "This session has expired. Kindly re-login to continue."
            })
        };


        await logoutUser(loggedInUser.id);

        return res.status(200).json({
            Message: "User logged out successfully"
        });
        
    } catch (error) {

        console.error("Error logging out user", error);
        
        return res.status(400).json({
            Error: "Error logging out user"
        });

    }
};