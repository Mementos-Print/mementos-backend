import { aToken, rToken } from "../lib/jwt";
import { sanitizeAuthUser } from "../utils/sanitize";
import { AuthContext } from "../dto/auth";



export const buildLoginResponse = (user: AuthContext) => {
  const sanitizedUser = sanitizeAuthUser(user);

  const accessToken = aToken({
    id: sanitizedUser.id,
    email: sanitizedUser.email,
    role: sanitizedUser.role,
  });

  const refreshToken = rToken({
    id: sanitizedUser.id,
    email: sanitizedUser.email,
    role: sanitizedUser.role,
  });

  return {
    message: "User logged in successfully",
    sanitizedUser,
    accessToken,
    refreshToken,
  };
};
