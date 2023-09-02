const Joi = require('joi');

const name = Joi.string().required().label('Name');
const email = Joi.string().email().lowercase().required().label('Email');
const password = Joi.string()
  .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]*$/)
  .error((errors) => {
    return errors.map((error) => {
      if (error.type === 'string.pattern.base') {
        return { message: 'Password must contain at least 1 capital letter, 1 number, and 1 special character' };
      }
      return error;
    });
  })
  .required()
  .label('Password');


const registerSchema = Joi.object({
    name,
    email,
    password
});

module.exports = registerSchema;
