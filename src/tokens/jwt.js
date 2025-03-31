import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const aToken = (payload) => {
    return jwt.sign(payload, config.asecret, {expiresIn: '15m'})
};

export const rToken = (payload) => {
    return jwt.sign(payload, config.rsecret, {expiresIn: '180d'})
};