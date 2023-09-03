const Joi = require('joi');

const name = Joi.string().required().label('Name');
const email = Joi.string().email().lowercase().required().label('Email');
const password = Joi.string().regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]*$/).required().label('Password');

const registerSchema = Joi.object({
    name,
    email,
    password
});

module.exports = registerSchema;
