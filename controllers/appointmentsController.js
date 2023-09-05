// Import models
const appointmentsModel = require('../models').appointments;
const usersModel = require('../models').users;

// Import files
const { generalMessages, appointmentMessages } = require('../utils/messages');
const {
  successObjectResponse,
  errorObjectResponse,
  errorArrayResponse,
  successArrayResponse,
} = require('../utils/response');

// Import controllers
const globalController = require('./globalController');
const { userMessages } = require('../utils/messages');
const Sequelize = require('sequelize');
const db = require('../models/index');
const { IsNullOrEmpty } = require('../utils/enum');

module.exports = {
  // Dashboard
  async dashboard(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
      successObjectRes.message = generalMessages.welcomeMessage;
      successObjectRes.data = {};
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

  // Book appointment
  async bookAppointment(req, res) {
    let successObjectRes = successObjectResponse;
    let errorObjectRes = errorObjectResponse;
    try {
        const newAppointmentDetails = await globalController.checkAvailabilityAndCreateNewAppointment(req);
        if (IsNullOrEmpty(newAppointmentDetails)) {
          throw new Error(appointmentMessages.appointmentCreateFail);
        } else {
          successObjectRes.message = appointmentMessages.appointmentCreateSuccess;
          successObjectRes.data = newAppointmentDetails;
        }
      
      res.status(201).send(successObjectRes);
    } catch (error) {
      errorObjectRes.message = error.message;
      res.status(400).send(errorObjectRes);
    }
  },

  // Get user appointments
  async getUserAppointments(req,res){
    let successArrayRes = successArrayResponse;
    let errorArrayRes = errorArrayResponse;
    try {
      const modelIncludeData = {
        model :   usersModel,
        attributes : [['id','userId']],
    }
     const appointmentDetails =  await globalController.getModuleDetails(appointmentsModel,'findAll', {userId : req.headers.loggedInUserId},[['id','appointmentId'],'title'],true, modelIncludeData);
     if(IsNullOrEmpty(appointmentDetails)){
      throw new Error(appointmentMessages.appointmentsDetailsFound);
     }else{
      successArrayRes.message = appointmentMessages.appointmentsDetailsFound;
      successArrayRes.data = appointmentDetails;
     }
      res.status(201).send(successArrayRes);
    } catch (error) {
      errorArrayRes.message = error.message;
      res.status(400).send(errorArrayRes);
    }
  }
};
