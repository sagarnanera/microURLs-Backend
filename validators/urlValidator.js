const joi = require("joi");

exports.urlValidator = joi.object({
    Original_URL: joi.string().uri().required(),
    customSlug: joi.string().regex(/^[a-zA-Z0-9]+$/).min(6).messages({
        'string.pattern.base': 'customSlug can only contain uppercase and lowercase letters, and numbers',
    }),
    captchaToken: joi.string().required()
});

exports.urlValidatorPrivate = joi.object({
    Original_URL: joi.string().uri().required(),
    customSlug: joi.string().regex(/^[a-zA-Z0-9]+$/).min(6).messages({
        'string.pattern.base': 'customSlug can only contain uppercase and lowercase letters, and numbers',
    })
});

exports.editURLValidator = joi.object({
    id: joi.string().required(),
    updatedSlug: joi.string().regex(/^[a-zA-Z0-9]+$/).min(6).messages({
        'string.pattern.base': 'customSlug can only contain uppercase and lowercase letters, and numbers',
    })
});

exports.deleteURLValidator = joi.object({
    id: joi.string().required(),
});