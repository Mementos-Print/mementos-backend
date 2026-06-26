import { AuthContext, SanitizedAuthUser } from "../dto/auth";

export const sanitizeAuthUser = (user: AuthContext): SanitizedAuthUser => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};
