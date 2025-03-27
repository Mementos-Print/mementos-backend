import joi from 'joi';

export const signUpStaffSchema = joi.object({
    email: joi.string().required().email()
});

export const loginStaffSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
});

export const verifyStaffOtp = joi.object({
    otp: joi.number().min(6).required(),
    email: joi.string().email().required(),
    name: joi.string().required(),
    password: joi.string().min(6).required()
});

export const verifyStaffPasswordOtpSchema = joi.object({
    otp: joi.number().min(6).required(),
    email: joi.string().email().required(),
    newPassword: joi.string().min(6).required()
});