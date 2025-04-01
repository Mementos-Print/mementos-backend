import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { config } from './config/env.js';
import { tables } from './utils/tables.functions.js';
import { userRouter } from './users/users.routes.js';
import { tokenRouter } from './tokens/tokens.routes.js';
import { imagesRouter } from './images/images.routes.js';
import { staffRouter } from './staff/staff.routes.js';


const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({limit: "50mb"}));

app.use('/users', userRouter);
app.use('/tokens', tokenRouter);
app.use('/images', imagesRouter);
app.use('/staff', staffRouter);

app.listen(config.port, async () => {

    await tables();
    console.log("Server running on port", config.port);
    
});