import express from 'express';
import "./lib/OAuth/strategies/google.strategy";
import { routes } from './utils/routes';
import { errorMiddleware } from './middleware/error.middleware';
import passport from 'passport';

export const app = express();

app.use(express.json());

app.use(passport.initialize());
app.use(routes);
app.use(errorMiddleware);