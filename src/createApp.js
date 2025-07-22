import './config/passport.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { tables } from './utils/tables.functions.js';
import { routes } from './utils/routes.js';
import passport from 'passport';

export const createApp = async () => {

    const app = express();

    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json({limit: "50mb"}));
    app.use(passport.initialize());

    await tables();

    app.use(routes);

    return app;

};