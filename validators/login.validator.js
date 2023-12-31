const Joi = require('joi')
const email = Joi.string().email().lowercase().required().label('Email');
const password = Joi.string().disallow("''", '""').required().label('Password');

const loginSchema = Joi.object({
    email,
    password
});

module.exports = loginSchema;
