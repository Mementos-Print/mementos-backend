import joi from 'joi'

export const createEventSchema = joi.object({
    title: joi.string().required(),
    date: joi.date().required()
});

export const updateEventSchema = joi.object({
    title: joi.string(),
    date: joi.date()
});