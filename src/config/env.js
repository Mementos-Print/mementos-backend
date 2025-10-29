import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim());

export const config = {
    port: process.env.PORT,
    asecret: process.env.ACCESS_SECRET_KEY,
    rsecret: process.env.REFRESH_SECRET_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    api_key: process.env.CLOUDINARY_KEY,
    cloud_name: process.env.CLOUDINARY_NAME,
    db: {
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        pass: process.env.DB_PASSWORD
    },
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    dburl: process.env.DATABASE_URL,
    origins: allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    googleClientID: process.env.CLIENT_ID,
    googleClientSecret: process.env.CLIENT_SECRET,
    userCallBackURI: process.env.CALLBACK_URI_USER,
    staffCallbackURI: process.env.CALLBACK_URI_STAFF

};