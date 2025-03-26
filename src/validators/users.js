import joi from 'joi';

export const loginUserSchema = joi.object({
    email: joi.string().required(),
    name: joi.string().required()
});