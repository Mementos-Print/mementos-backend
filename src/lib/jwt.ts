import * as jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "./env";
import { UnauthorizedError } from "../utils/app.errors";
import { logger } from "./logger";

export const tokenPayloadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF", "USER"]),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export const aToken = (payload: TokenPayload): string => {
  logger.info({message: `Generating access token with payload:`, payload});
  return jwt.sign(payload, env.ACCESS_SECRET, {
    expiresIn: "1h",
  });
};

export const rToken = (payload: TokenPayload): string => {
  logger.info({ message: `Generating refresh token with payload:`, payload });
  return jwt.sign(payload, env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  logger.info(`Verifying access token: ${token}`);
  try {
    const decoded = jwt.verify(token, env.ACCESS_SECRET);
    return tokenPayloadSchema.parse(decoded);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new UnauthorizedError("Invalid token payload");
    }
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.REFRESH_SECRET);
    return tokenPayloadSchema.parse(decoded);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new UnauthorizedError("Invalid token payload");
    }
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

// export const userRoleSchema = z.enum([
//   "ADMIN",
//   "STAFF",
//   "USER",
// ]);

// export type UserRole = z.infer<typeof userRoleSchema>;

// export const rolesArraySchema = z.array(userRoleSchema);

// export const onboardingToken = (
//   payload: Omit<TokenPayload, "roleVersion"> & { type: "onboarding" },
// ): string => {
//   return jwt.sign(payload, env.ONBOARDING_SECRET, {
//     expiresIn: "15m",
//   });
// }

// export const passwordResetToken = (
//   payload: Omit<TokenPayload, "roles" | "roleVersion"> & { type: "password_reset" },
// ): string => {
//   return jwt.sign(payload, env.ONBOARDING_SECRET, {
//     expiresIn: "15m",
//   });
// };

// export const verifyOnboardingToken = (
//   token: string,
// ): Omit<TokenPayload, "roleVersion"> & { type: "onboarding" } => {
//   try {
//     const decoded = jwt.verify(token, env.ONBOARDING_SECRET);
//     return onboardingActionTokenSchema.parse(decoded);
//   } catch (err) {
//     if (err instanceof z.ZodError) {
//       throw new UnauthorizedError("Invalid token payload");
//     }
//     throw new UnauthorizedError("Invalid or expired onboarding token");
//   }
// }

// export const verifyPasswordResetToken = (
//   token: string,
// ): Omit<TokenPayload, "roles" | "roleVersion"> & { type: "password_reset" } => {
//   try {
//     const decoded = jwt.verify(token, env.ONBOARDING_SECRET);
//     return actionTokenSchema.extend({
//       type: z.literal("password_reset"),
//     }).parse(decoded);
//   } catch (err) {
//     if (err instanceof z.ZodError) {
//       throw new UnauthorizedError("Invalid token payload");
//     }
//     throw new UnauthorizedError("Invalid or expired password reset token");
//   }
// };
