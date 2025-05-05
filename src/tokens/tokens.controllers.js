import jwt from 'jsonwebtoken';
import { config } from "../config/env.js";
import { aToken } from "./jwt.js";


export const refreshStaffTokenController = async (req, res) => {
    try {
        
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken)
        if (!refreshToken) {
            return res.status(401).json({ Error: "No refresh token provided" });
        }

        const decodedToken = jwt.decode(refreshToken);
        if (!decodedToken) {
            return res.status(403).json({ Error: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, config.rsecret, (error, user) => {
            if (error) {
                return res.status(403).json({ Error: "Session expired. Please re-login" });
            }

            const newAccessToken = aToken({ id: user.id, role: user.role });

            return res.status(200).json({
                accessToken: newAccessToken
            });
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({ Error: "Internal Server Error" });
    }
};

export const refreshUserTokenController = async (req, res) => {
    try {
        
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ Error: "No refresh token provided" });
        }

        const decodedToken = jwt.decode(refreshToken);
        if (!decodedToken) {
            return res.status(403).json({ Error: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, config.rsecret, (error, user) => {
            if (error) {
                return res.status(403).json({ Error: "Session expired. Please re-login" });
            }

            const newAccessToken = aToken({ id: user.id, role: user.role });

            return res.status(200).json({
                accessToken: newAccessToken
            });
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({ Error: "Internal Server Error" });
    }
};

export const logoutStaffController = async (req, res) => {
    try {
        const loggedInStaff = req.user;

        if (!loggedInStaff) {
            return res.status(401).json({
                Error: "Unauthorized"
            });
        }

        // Clear the refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true, // Only send over HTTPS in production
            sameSite: "None" // Adjust if frontend is on a different domain
        });

        return res.status(200).json({
            Message: "Staff logged out successfully"
        });

    } catch (error) {
        console.error("Error logging out staff", error);

        return res.status(400).json({
            Error: "Error logging out staff"
        });
    }
};

export const logoutUserController = async (req, res) => {
    try {
        const loggedInStaff = req.user;

        if (!loggedInStaff) {
            return res.status(401).json({
                Error: "Unauthorized"
            });
        }

        // Clear the refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true, // Only send over HTTPS in production
            sameSite: "None" // Adjust if frontend is on a different domain
        });

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