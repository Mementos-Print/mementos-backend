import { Crypt } from "../lib/encrypt";
import { logger } from "../lib/logger";
import { UserRepository } from "../repositories/users.repository";
import { BadRequestError, UnauthorizedError } from "../utils/app.errors";

export const loginService = async (email: string, password: string) => {
  const userExists = await UserRepository.getUserByEmail(email);

  if (!userExists) {
    logger.warn(`Login attempted on non-existing user: ${email}`);
    throw new BadRequestError(`Invalid credentials`);
  }

  // OAuth-only account (no password set)
  if (!userExists.password) {
    throw new UnauthorizedError(
      "This account was created using a provider. Please sign in using that provider.",
    );
  }

  const passwordMatch = await Crypt.compare(password, userExists.password);

  if (!passwordMatch) {
    throw new BadRequestError(`Invalid credentials`);
  }

  return userExists;
};
