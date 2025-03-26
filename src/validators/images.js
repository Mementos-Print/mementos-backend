import Joi from "joi";

export const deleteImagesSchema = Joi.object({
    imageID: Joi.alternatives()
        .try(
            Joi.string().required(),
            Joi.number().required(),
            Joi.array().items(Joi.string(), Joi.number()).required()
        )
        .required()
});