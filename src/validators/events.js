import joi from 'joi'

export const createEventSchema = joi.object({
    title: joi.string().required(),
    theme: joi.string().required(),
    date: joi.date().required()
});

export const joinEventSchema = joi.object({
    eventCode: joi.string().min(6).required()
});