// Import models
const usersModel = require('../models').users;
const appointmentsModel = require('../models').appointments;
const specialSchedulesModel = require('../models').special_schedules;

// Import modules
const moment = require('moment');

//Import files
const Sequelize = require('sequelize');
const { IsNotNullOrEmpty, IsNullOrEmpty } = require('../utils/enum');
const {
  dateTimeMessages,
  appointmentMessages,
  userMessages,
} = require('../utils/messages');
const db = require('../models/index');

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
      if (IsNullOrEmpty(returningAttributes)) {
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
   * Check appointment availability and create new appointment
   */
  async checkAvailabilityAndCreateNewAppointment(req) {
    try {
      let newAppointmentDetails = {};
      const checkDate = await this.checkDate(req);
      const checkTime = await this.checkTime(req);
      // Check valid date and time
      if (checkDate === true && checkTime === true) {
        // Check user and guest id are not same
        if (req.headers.loggedInUserId == req.body.guestId) {
          throw new Error(appointmentMessages.notAllowedToScheduleAppointment);
        } else {
          // Check guestId is valid or not
          const guestUserDetails = await this.getModuleDetails(
            usersModel,
            'findOne',
            { id: req.body.guestId },
            ['id', 'name', 'email'],
            true
          );
          if (IsNotNullOrEmpty(guestUserDetails.id)) {
            // Check existing appointments
            const checkExistingAppointments = await this.checkExistingAppointments(req);
            if (checkExistingAppointments === true) {
              // Check special schedules
              const checkSpecialSchedules = await this.checkSpecialSchedules(req);
              if (checkSpecialSchedules === true) {
                newAppointmentDetails = await this.newAppointmentDetails(req);
              }else{
                // Check weekends
                const checkWeekends = await this.checkWeekends(req);
                if (checkWeekends === true) {
                  newAppointmentDetails = await this.newAppointmentDetails(req);
                }
              }
            }
          } else {
            throw new Error(userMessages.guestUserNotFound);
          }
        }
      }
      return newAppointmentDetails;
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

  // Check time
  async checkTime(req) {
    try {
      const desiredStartTime = moment('08:00', 'HH:mm');
      const desiredEndTime = moment('20:00', 'HH:mm');

      const requestedStartTime = moment(req.body.startTime, 'HH:mm');
      const requestedEndTime = moment(req.body.endTime, 'HH:mm');

      if (requestedStartTime.isSame(requestedEndTime)) {
        throw new Error(dateTimeMessages.inputTimeCanNotBeTheSame);
      } else if (!requestedStartTime.isSameOrAfter(desiredStartTime)) {
        throw new Error(dateTimeMessages.invalidStartTime);
      } else if (!requestedEndTime.isSameOrBefore(desiredEndTime)) {
        throw new Error(dateTimeMessages.invalidEndTime);
      } else {
        return true;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Check existing appointments
  async checkExistingAppointments(req) {
    try {
      const existingAppointmentDetails = await this.getModuleDetails(
        appointmentsModel,
        'findAll',
        {
          date: req.body.date,
          userId: req.headers.loggedInUserId,
          guestId: req.body.guestId,
        },
        ['id', 'date', 'startTime', 'endTime'],
        true
      );
      if (IsNotNullOrEmpty(existingAppointmentDetails)) {
        existingAppointmentDetails.forEach((existingAppointment) => {
          const existingAppointmentStartTime = moment(
            existingAppointment.startTime,
            'HH:mm'
          );
          const existingAppointmentEndTime = moment(
            existingAppointment.endTime,
            'HH:mm'
          );
          const requestedStartTime = moment(req.body.startTime, 'HH:mm');
          const requestedEndTime = moment(req.body.endTime, 'HH:mm');
          if (
            requestedStartTime.isSame(existingAppointmentStartTime) ||
            (requestedStartTime.isAfter(existingAppointmentStartTime) &&
              requestedStartTime.isBefore(existingAppointmentEndTime)) ||
            requestedStartTime.isBefore(existingAppointmentEndTime) ||
            requestedEndTime.isSameOrBefore(existingAppointmentEndTime)
          ) {
            throw new Error(
              `${appointmentMessages.appointmentExists} ${existingAppointment.date} from ${existingAppointment.startTime} to ${existingAppointment.endTime}`
            );
          }
        });
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Check special schedules
  async checkSpecialSchedules(req) {
    try {
      const specialSchedulesDetails = await this.getModuleDetails(
        specialSchedulesModel,
        'findAll',
        { date: req.body.date, userId: req.body.guestId },
        ['id', 'statusType', 'date', 'startTime', 'endTime'],
        true
      );
      if (IsNotNullOrEmpty(specialSchedulesDetails)) {
        specialSchedulesDetails.forEach((specialSchedules) => {
          const specialScheduleStartTime = moment(
            specialSchedules.startTime,
            'HH:mm'
          );
          const specialScheduleEndTime = moment(
            specialSchedules.endTime,
            'HH:mm'
          );
          const requestedStartTime = moment(req.body.startTime, 'HH:mm');
          const requestedEndTime = moment(req.body.endTime, 'HH:mm');

          if (specialSchedules.statusType === 'available') {
            if (
              !(
                requestedStartTime.isSameOrAfter(specialScheduleStartTime) &&
                requestedEndTime.isSameOrBefore(specialScheduleEndTime)
              )
            ) {
              throw new Error(
                `${userMessages.guestUserNotAvailable} ${specialSchedules.date} from ${req.body.startTime} to ${req.body.endTime}`
              );
            }
          } else if (specialSchedules.statusType === 'unavailable') {
            if (
              requestedStartTime.isSameOrAfter(specialScheduleStartTime) &&
              requestedEndTime.isSameOrBefore(specialScheduleEndTime)
            ) {
              throw new Error(
                `${userMessages.guestUserNotAvailable} ${specialSchedules.date} from ${req.body.startTime} to ${req.body.endTime}`
              );
            }
          }
        });
        return true;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Check weekends (By default set to saturday and sunday)
  async checkWeekends(req) {
    try {
      const dateString = req.body.date;
      const inputTimezone = 'UTC';
      const inputDate = moment.tz(dateString, 'DD-MM-YYYY', inputTimezone);
      // Check if the inputDate is Saturday (6) or Sunday (0)
      if (inputDate.day() === 6 || inputDate.day() === 0) {
        throw new Error(dateTimeMessages.weekendDateNotAllowed);
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Create new appointment
  async newAppointmentDetails(req){
    try {
      const { title, agenda, date, startTime, endTime, guestId } = req.body;
     let newAppointmentDetails = {};
      await db.sequelize.transaction(
        {
          deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        async (t1) => {
          await appointmentsModel
            .create(
              { title, agenda, date, startTime, endTime, guestId, userId : req.headers.loggedInUserId },
              { transaction: t1 },
              { raw: true }
            )
            .then(async (createdAppointmentDetails) => {
              newAppointmentDetails = createdAppointmentDetails;
            })
            .catch(async (error) => {
              let message =
                await globalController.getMessageFromErrorInstance(error);
              if (message) {
                throw new Error(message);
              } else {
                throw new Error(error.message);
              }
            });
        }
      );
      return newAppointmentDetails;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
