import { AuthType, Role } from "@prisma/client";


export interface OAuthResult {
  user: {
    id: string;
    email: string;
    firstname?: string | null;
    lastname?: string | null;
    role: Role;
  };
}

export interface NormalizedOAuthProfile {
  provider: AuthType;
  providerId: string;
  email: string;
  fullname: string;
}