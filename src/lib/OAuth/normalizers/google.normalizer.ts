import { Profile as GoogleProfile } from "passport-google-oauth20";
import { NormalizedOAuthProfile } from "../../../dto/OAuth";
import { AuthType } from "@prisma/client";

export function normalizeGoogleProfile(
  profile: GoogleProfile,
): NormalizedOAuthProfile {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error("No email provided by Google");
  }

  return {
    provider: AuthType.GOOGLE,
    providerId: profile.id,
    email,
    fullname: profile.displayName,
  };
}
