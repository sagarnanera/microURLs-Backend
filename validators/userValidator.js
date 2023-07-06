const joi = require("joi");

exports.userValidator = joi.object({
    userName: joi.string().max(15),
    email: joi.string().email(),
    password: joi.string().min(6)
})