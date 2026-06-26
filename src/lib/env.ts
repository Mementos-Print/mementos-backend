import {z} from 'zod';
import "dotenv/config";

export const env = z
  .object({
    PORT: z.coerce.number().default(7300),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    ACCESS_SECRET: z.string(),
    REFRESH_SECRET: z.string(),
  })
  .parse(process.env);