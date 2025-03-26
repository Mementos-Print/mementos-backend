import { aToken, rToken } from "../tokens/jwt.js";
import { alterUserTokens, findRefreshTokenByUser, saveUserRefreshToken } from "../tokens/tokens.services.js";
import { hashPassword } from "../utils/bcrypt.js";
import { uniqueID } from "../utils/uuid.js";
import { loginUserSchema } from "../validators/users.js";
import { findUserByEmail, signUpUser } from "./users.services.js";


export const loginUserController = async (req, res) => {
    try {

        const {error, value} = loginUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                Error: error.message
            });
        };

        const {email, name} = value;

        const user = await findUserByEmail(email);
        
        if(user.rows.length == 0) {

            await signUpUser(uniqueID, email, name);

            const userDetails = await findUserByEmail(email);

            if(userDetails.rows.length == 0) {
                return res.status(404).json({
                    Error: "User not found"
                })
            };

            const loggedIn = await findRefreshTokenByUser(userDetails.rows[0].userid);

            const accessToken = aToken({id: userDetails.rows[0].userid, name: name, role: 'customer'});

            const refreshToken = rToken({id: userDetails.rows[0].userid, name: name, role: 'customer'});

            const hashedToken = await hashPassword(refreshToken);

            if (loggedIn.rows.length > 0) {
                await alterUserTokens(userDetails.rows[0].userid, refreshToken);

                return res.status(201).json({
                    Message: "User logged in successfully!",
                    accessToken, refreshToken
                });
            };

            await saveUserRefreshToken(userDetails.rows[0].userid, hashedToken);

            return res.status(201).json({
                Message: "User logged in successfully!",
                accessToken, refreshToken
            });

        };

        const loggedIn = await findRefreshTokenByUser(user.rows[0].userid);

        const accessToken = aToken({id: user.rows[0].userid, name: name, role: 'customer'});

        const refreshToken = rToken({id: user.rows[0].userid, name: name, role: 'customer'});

        const hashedToken = await hashPassword(refreshToken);

        if (loggedIn.rows.length > 0) {
            await alterUserTokens(user.rows[0].userid, refreshToken);

            return res.status(201).json({
                Message: "User logged in successfully!",
                accessToken, refreshToken
            });
        };

        await saveUserRefreshToken(user.rows[0].userid, hashedToken)

        return res.status(201).json({
            Message: "User logged in successfully!",
            accessToken, refreshToken
        });
        
    } catch (error) {

        console.log("Error logging", error);
        
        return res.status(400).json({
            Error: "Error logging in."
        });
        
    }
};