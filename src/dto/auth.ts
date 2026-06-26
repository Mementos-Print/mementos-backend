import { Role } from "@prisma/client";

export interface AuthContext {
  id: string;
  email: string;
  role: Role;
}

export interface SanitizedAuthUser {
  id: string;
  email: string;
  role: Role;
}
