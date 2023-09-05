const Joi = require('joi');

const name = Joi.string().disallow("''", '""').label('Name');
const email = Joi.string().email().lowercase().label('Email');

const userUpdateSchema = Joi.object({
    name,
    email,
});

module.exports = userUpdateSchema;
