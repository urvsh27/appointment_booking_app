// Import models
const usersModel = require('../models').users;

// Import modules
const moment = require('moment');

//Import files
const Sequelize = require('sequelize');
const { IsNotNullOrEmpty, IsNullOrEmpty } = require('../utils/enum');
const { dateTimeMessages, appointmentMessages } = require('../utils/messages');

module.exports = {
  /*
   * modelInstance : modelName
   * query  : findOne,
   * whereCondition : object,
   * returningAttributes : array
   * raw : boolean
   * offset : number
   * limit : number
   * modelIncludeData : array
   */
  async getModuleDetails(
    modelInstance,
    queryName,
    whereCondition,
    returningAttributes,
    raw,
    modelIncludeData,
    offset,
    limit
  ) {
    try {
      let responseDetails = {};
      if(IsNullOrEmpty(returningAttributes)) {
        returningAttributes = [];
      }
      const availableQueryNames = [
        'findAll',
        'findByPk',
        'findOne',
        'findAndCountAll',
      ];
      if (availableQueryNames.includes(queryName)) {
        if (queryName === 'findOne') {
          await modelInstance
            .findOne({
              attributes: returningAttributes,
              where: whereCondition,
              offset: offset,
              limit: limit,
              raw: raw,
              include: modelIncludeData,
            })
            .then((queryResult) => {
              if (IsNotNullOrEmpty(queryResult)) {
                responseDetails = queryResult;
              }
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        } else if (queryName === 'findAll') {
          await modelInstance
            .findAll({
              attributes: returningAttributes,
              where: whereCondition,
              offset: offset,
              limit: limit,
              raw: raw,
              include: modelIncludeData,
            })
            .then((queryResult) => {
              if (IsNotNullOrEmpty(queryResult)) {
                responseDetails = queryResult;
              }
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        }
      } else {
        throw new Error(`${queryName} method is not available.`);
      }
      return responseDetails;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /*
  errors= [
    ValidationErrorItem {
      message: 'email must be unique',
      type: 'unique violation',
      path: 'email',
      value: 'urvish@gmail.com',
      origin: 'DB',
      instance: [users],
      validatorKey: 'not_unique',
      validatorName: null,
      validatorArgs: []
    }
  ],
  */

  /*
   * Instants Models error handler
   */
  async getMessageFromErrorInstance(error) {
    try {
      let message = '';
      if (error instanceof Sequelize.ForeignKeyConstraintError) {
        (message = 'Foreign key constraint error'), error.message;
      } else if (error instanceof Sequelize.ValidationError) {
        let validationErrorArray = error.errors;
        if (validationErrorArray.length > 0) {
          for (let i = 0; i < validationErrorArray.length; i++) {
            if (message != '') {
              message += ', ' + validationErrorArray[i].message;
            } else {
              message += validationErrorArray[i].message;
            }
          }
        }
      } else {
        message = error.message;
      }
      return message;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /*
   * Check appointment availability
   */
  async checkAppointmentAvailability(req) {
    try {
      const checkDate = await this.checkDate(req);
      const checkTime = await this.checkTime(req);
      if (checkDate === true && checkTime === true) {
        if (req.headers.loggedInUserId == req.body.guestId) {
          throw new Error(appointmentMessages.notAllowedToScheduleAppointment);
        }
        const guestUserDetails = await this.getModuleDetails(
          usersModel,
          'findOne',
          { id: req.body.guestId },
          ['id', 'name', 'email'],
          true
        );
        if (IsNotNullOrEmpty(guestUserDetails.id)) {
          return true;
        } else {
          throw new Error('Guest user not found.');
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Check date
  async checkDate(req) {
    try {
      const dateString = req.body.date;
      const inputTimezone = 'UTC';
      const currentTimezone = 'UTC';
      const inputDate = moment.tz(dateString, 'DD-MM-YYYY', inputTimezone);
      const currentDate = moment().tz(currentTimezone);
      currentDate.startOf('day');
      if (inputDate.isSameOrAfter(currentDate)) {
        return true;
      } else {
        throw new Error(dateTimeMessages.invalidDate);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Check Time
  async checkTime(req) {
    try {
      const desiredStartTime = moment('08:00', 'HH:mm');
      const desiredEndTime = moment('20:00', 'HH:mm');

      const parsedStartTime = moment(req.body.startTime, 'HH:mm');
      const parsedEndTime = moment(req.body.endTime, 'HH:mm');

      if (!parsedStartTime.isSameOrAfter(desiredStartTime)) {
        throw new Error(dateTimeMessages.invalidStartTime);
      } else if (!parsedEndTime.isSameOrBefore(desiredEndTime)) {
        throw new Error(dateTimeMessages.invalidEndTime);
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
