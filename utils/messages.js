const generalMessages = {
  dbConnectionSuccess : 'Postgresql connected successfully.',
  dbConnectionFail : 'Unable to connect to the database.',
  dbSyncSuccess : 'Database synced.',
  welcomeMessage : 'Welcome to the Appointment Scheduling mern web app',
  jwtTokenRequired : 'Authorization token required.',
  jwtTokenExpired : 'JWT token expired.',
  unableToVerifyJwtToken : 'Unable to verify jwt token.',
};

const userMessages = {
  userRegisterSuccess: 'User registered successfully.',
  userRegisterFail: 'User registration failed, please try again later.',
  userAlreadyExists: 'User already exists with this email address.',
  userNotFound : 'User not found with this email address.',
  userLoginSuccess : 'User login successfully.',
  userLoginFailure : 'User login failed, please check email and password.',
  guestUserNotFound : 'Guest user not found.',
  allUsersDetailsNotFound : 'All users details not found, please try again later.',
  allUsersDetailsFound :'All users details found successfully.', 
  guestUserNotAvailable : 'Guest user not available on',
};

const dateTimeMessages = {
  invalidDate : 'You have selected Invalid date (past date).',
  invalidStartTime : 'Start time should be 08:00 or more.',
  invalidEndTime : 'End time should be 20:00 or less.',
  inputTimeCanNotBeTheSame : 'Startime and Endtime can not be the same.',
  weekendDateNotAllowed : 'Weekend date is not allowed.',
};

const appointmentMessages = {
  notAllowedToScheduleAppointment : 'You are not allowed to schedule an appointment with yourself.',
  appointmentsDetailsNotFound : 'Appointments details not found. Please try again later.',
  appointmentsDetailsFound : 'Appointments details found successfully.',
  appointmentExists : 'Appointment exists on',
  appointmentCreateFail : 'Unable to create an Appointment',
  appointmentCreateSuccess : 'Appointment created successfully.',
};

module.exports = {
  generalMessages,
  userMessages,
  dateTimeMessages,
  appointmentMessages,
};
