import joi from 'joi';

export const signUpUserSchema =joi.object({
    email: joi.string().email().required()
});

export const validateUserOtpSchema = joi.object({
    otp: joi.number().required(),
    email: joi.string().required(),
    name: joi.string().required()
});

export const loginUserSchema = joi.object({
    email: joi.string().required()
});