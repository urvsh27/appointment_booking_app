// Import modules
const createHttpError = require('http-errors');
const Joi = require('joi');

//Import files
const Validators = require('../validators');
const { errorObjectResponse } = require('../utils/response');
const { generalMessages } = require('../utils/messages');

module.exports = function (validatorName) {
  return async function (req, res, next) {
    let errorObjectRes = errorObjectResponse;
    try {
      if(req.body == undefined || req.body == null){
        throw new Error(generalMessages.requestBodyUndefinedOrNull);
      }
      if (!Validators.hasOwnProperty(validatorName)) {
        throw new Error(`'${validatorName}' validator does not exist`);
      }
      const validated = await Validators[validatorName].validateAsync(
        req.body,
        { abortEarly: false }
      );
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi===true) {
        // Handle joi errors
        errorObjectRes.message = error.details.map((detail) => detail.message).join(', ');
        errorObjectRes.message = errorObjectRes.message.replace(/"/g, ''); // Remove double quotes
      } else {
        // Handle other errors
        errorObjectRes.message = error.message;
      }
      return res.status(422).send(errorObjectRes);
    }
  };
};
