import { UserCredentialsDto } from "../dto/users";
import { db } from "../lib/db";
import { Crypt } from "../lib/encrypt";
import { logger } from "../lib/logger";
import { UserRepository } from "../repositories/users.repository";
import { BadRequestError } from "../utils/app.errors";


export const registerService = async (data: UserCredentialsDto) => {
    return db.$transaction(async (tx) => {
        const userExists = await UserRepository.getUserByEmailTx(data.email, tx);

        if(userExists) {
            logger.warn(`Signup attempted on existing user with email: ${data.email}`);
            throw new BadRequestError(`User already exists`);
        };

        data.password = await Crypt.hash(data.password);

        const user = await UserRepository.CreateOrIgnore(data, tx);

        return user;
    });
};