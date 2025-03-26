import joi from 'joi';

export const refreshTokenSchema = joi.object({
    refreshToken: joi.string().required()
});