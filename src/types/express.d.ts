// src/types/express.d.ts
import { AuthContext } from "../dto/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
