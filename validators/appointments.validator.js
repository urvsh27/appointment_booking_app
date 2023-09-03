const Joi = require('joi');
const title =Joi.string().required().label('Title'); 
const agenda =Joi.string().required().label('Agenda');
const date = Joi.string().required().regex(/^\d{2}-\d{2}-\d{4}$/).label('Date (dd-mm-yyyy)');
const startTime =Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().label('Start Time');
const endTime =Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().label('End Time');
const guestId =Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).required().label('Guest ID');

const appointmentSchema = Joi.object({
    title,
    agenda,
    date,
    startTime,
    endTime,
    guestId
});

module.exports = appointmentSchema;
