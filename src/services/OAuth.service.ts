import { NormalizedOAuthProfile } from "../dto/OAuth";
import { db } from "../lib/db";
import { OAuthProviderRepository } from "../repositories/OAuth.repository";
import { BadRequestError } from "../utils/app.errors";
import { UserRepository } from "../repositories/users.repository";

export class OAuthService {
  static async signInWithOAuth(profile: NormalizedOAuthProfile) {
    const { provider, providerId, email, fullname } = profile;

    return db.$transaction(async (tx) => {
      // 1️⃣ Check if user already exists
      const existingUser = await UserRepository.getUserByEmailTx(email, tx);

      if (existingUser) {
        const linkedProvider = existingUser.authProviders.find(
          (p) => p.provider === provider,
        );

        if (!linkedProvider) {
          await OAuthProviderRepository.create(
            tx,
            providerId,
            provider,
            existingUser.id,
          );
        } else if (linkedProvider.providerUserId !== providerId) {
          throw new BadRequestError(
            `This ${provider} account is already linked to another identity`,
          );
        }

        return {
          user: existingUser,
        };
      }

      // 2️⃣ Create new user
      const user = await UserRepository.createOrIgnore(
        {
          email,
          name: fullname,
          password: null,
        },
        tx,
      );

      // 3️⃣ Link OAuth provider
      await OAuthProviderRepository.create(tx, providerId, provider, user.id);

      return {
        user,
      };
    });
  }
}
