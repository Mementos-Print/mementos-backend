import joi from 'joi';

export const signUpStaffSchema = joi.object({
    email: joi.string().required().email(),
    name: joi.string().required(),
    password: joi.string().min(6).required()
});

export const loginStaffSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

export const forgotPasswordSchema = joi.object({
    email: joi.string().email().required()
});

export const verifyStaffPasswordOtpSchema = joi.object({
    otp: joi.number().min(6).required(),
    email: joi.string().email().required(),
    newPassword: joi.string().min(6).required()
});

export const updateStaffRoleSchema = joi.object({
    email: joi.string().email().required(),
    role: joi.string().required()
});