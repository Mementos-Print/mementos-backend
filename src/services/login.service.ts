import { Crypt } from "../lib/encrypt";
import { logger } from "../lib/logger";
import { UserRepository } from "../repositories/users.repository";
import { BadRequestError } from "../utils/app.errors";


export const loginService = async (email:string, password: string) => {
    const userExists = await UserRepository.getUserByEmail(email);

    if(!userExists){
        logger.warn(`Login attempted on non-existing user: ${email}`);
        throw new BadRequestError(`Invalid credentials`);
    };

    const passwordMatch = await Crypt.compare(password, userExists.password);

    if(!passwordMatch){
        throw new BadRequestError(`Invalid credentials`);
    };

    return userExists;
};