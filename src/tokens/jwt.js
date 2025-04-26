import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const aToken = (payload) => {
    return jwt.sign(payload, config.asecret, {expiresIn: '180d'})
};

export const rToken = (payload) => {
    return jwt.sign(payload, config.rsecret, {expiresIn: '180d'})
};