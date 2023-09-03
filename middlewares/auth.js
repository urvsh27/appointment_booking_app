// Import modules
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

// Import files
const { jwtSecretKey } = require('../appConfig');
const { IsNullOrEmpty, IsNotNullOrEmpty } = require('../utils/enum');
const { generalMessages } = require('../utils/messages');
const { successObjectResponse, errorObjectResponse } = require('../utils/response');

module.exports = {
  /*
   * Hash the password
   */
  async getHashedPassword(password) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /*
   * Compare the hashed password
   */
  async compareHashedPassword(password, hashedPassword) {
    try {
      return bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /*
   * Create a jwt token
   */
  async createJwtToken(value) {
    try {
      const token = JWT.sign({ value }, jwtSecretKey, {
        expiresIn: '1d',
        algorithm: 'HS256',
      });
      return token;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /*
   * Jwt verify (function name kept as userAuthValidate to differentiate for admin or any other role validations)
  */
  async jwtUserAuthValidate(req, res, next) {
    let errorObjectRes = errorObjectResponse;
    try {
      if (IsNullOrEmpty(req.headers.authorization)) {
        throw new Error(generalMessages.jwtTokenRequired);
      } else {
        var decoded = {};
        decoded = JWT.verify(req.headers.authorization, jwtSecretKey);
        if (IsNotNullOrEmpty(decoded)) {
          next();
        } else {
          throw new Error(generalMessages.unableToVerifyJwtToken);
        }
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        errorObjectRes.status = '5';
        errorObjectRes.message = generalMessages.jwtTokenExpired;
      } else {
        errorObjectRes.message = error.message;
      }
      res.status(400).send(errorObjectRes);
    }
  },
};
