import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { env } from "../../env";
import { OAuthService } from "../../../services/OAuth.service";
import { normalizeGoogleProfile } from "../normalizers/google.normalizer";

passport.use(
  "google-auth",
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string | undefined,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const normalized = normalizeGoogleProfile(profile);

        const user = await OAuthService.signInWithOAuth(normalized);

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);
