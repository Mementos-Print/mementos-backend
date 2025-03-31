import { config } from "./env.js";


export const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || config.origins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(null, false);
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Explicitly allow common HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow common headers
    credentials: true, // Allow cookies & auth headers to be sent
};