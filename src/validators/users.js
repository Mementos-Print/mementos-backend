import joi from 'joi';


export const signUpUserSchema = joi.object({
    email: joi.string().email().required(),
    name: joi.string().required(),
    password: joi.string().required()
});

export const loginUserSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});