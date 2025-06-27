import './config/passport.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { config } from './config/env.js';
import { tables } from './utils/tables.functions.js';
import { routes } from './utils/routes.js';
import passport from 'passport';


const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({limit: "50mb"}));
app.use(passport.initialize());

app.use(routes);

app.listen(config.port, async () => {

    await tables();
    console.log("Server running on port", config.port);
    
});