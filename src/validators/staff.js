import joi from 'joi';

export const signUpStaffSchema = joi.object({
    email: joi.string().required().email(),
    name: joi.string().required(),
    password: joi.string().required()
});

export const loginStaffSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
});