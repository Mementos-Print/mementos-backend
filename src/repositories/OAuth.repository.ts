import { AuthType, Prisma } from "@prisma/client";

export class OAuthProviderRepository {
  /**
   * Find provider by provider + providerUserId
   */
  static findByProviderIdentity(
    tx: Prisma.TransactionClient,
    provider: AuthType,
    providerUserId: string,
  ) {
    return tx.authProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Find provider by providerUserId only (if needed)
   */
  static findByProviderUserId(
    tx: Prisma.TransactionClient,
    providerUserId: string,
  ) {
    return tx.authProvider.findFirst({
      where: {
        providerUserId,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Create a new OAuth provider link
   */
  static create(
    tx: Prisma.TransactionClient,
    providerUserId: string,
    provider: AuthType,
    userId: string,
    providerEmail?: string | null,
  ) {
    return tx.authProvider.create({
      data: {
        provider,
        providerUserId,
        userId,
        providerEmail: providerEmail ?? null,
      },
    });
  }

  /**
   * Update OAuth tokens (if storing provider tokens)
   */
  static updateTokens(
    tx: Prisma.TransactionClient,
    id: string,
    accessTokenHash?: string | null,
    refreshTokenHash?: string | null,
    expiresAt?: Date | null,
  ) {
    return tx.authProvider.update({
      where: { id },
      data: {
        accessTokenHash,
        refreshTokenHash,
        expiresAt,
      },
    });
  }

  /**
   * Soft delete provider link
   */
  static softDelete(tx: Prisma.TransactionClient, id: string) {
    return tx.authProvider.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
