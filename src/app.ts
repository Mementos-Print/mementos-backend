import express from 'express';
import { routes } from './utils/routes';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

app.use(express.json());

app.use(routes);
app.use(errorMiddleware);