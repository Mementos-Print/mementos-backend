import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getEventUsers } from '../events/events.services.js';

export const auth = async (req, res, next) => {
    try {

        const authHeader = await req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({error: "Unauthorized, no authHeader"})
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: "Unauthorized, no token provided"})
    }
    jwt.verify(token, config.asecret, (error, user) => {
        if (error) {
            return res.status(403).json({error: "This session has expired. Kindly re-login"});
        }
        req.user = user;
        next();
    });
        
    } catch (error) {

        console.error("Internal server error: auth", error);

        return res.status(500).json({
            Error: "Internal server error."
        });
        
    }
};

export const staffAuth = async (req, res, next) => {
    try {

        const user = req.user;

        if(user.role != 'admin' && user.role != 'staff') {
            return res.status(403).json({
                error: "You are not authorized to access this page"
            });
        };

        next();
        
    } catch (error) {

        console.error("Internal server error: staff auth", error);

        return res.status(500).json({
            Error: "Internal server error."
        });
        
    }
};

export const adminAuth = async (req, res, next) => {
    try {

        const user = req.user;

        if(user.role != 'admin') {
            return res.status(403).json({
                error: "You are not authorized to access this page"
            });
        };

        next();
        
    } catch (error) {

        console.error("Internal server error: admin auth", error);

        return res.status(500).json({
            Error: "Internal server error."
        });
        
    }
};

export const eventAuth = async (req, res, next) => {
  try {

    const user = req.user;
    const eventCode = req.body

    const joinedEvent = await getEventUsers(user.id, eventCode);

    if (joinedEvent.rows.length === 0) {
        return res.status(403).json({
            error: "enter an event code to join this event"
        });
    };

    next();
    
  } catch (error) {

    console.error("Internal server error: event auth", error);
    
    return res.status(500).json({Error: "Internal server error"});
    
  }  
};