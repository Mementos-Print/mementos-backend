import joi from 'joi';


export const loginUserSchema = joi.object({
    email: joi.string().email().required(),
    name: joi.string().required()
});