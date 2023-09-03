//Import validators
const register = require('./register.validator');
const login = require('./login.validator');
const appointments = require('./appointments.validator');

module.exports = {
    register,
    login,
    appointments
};