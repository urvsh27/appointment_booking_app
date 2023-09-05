//Import validators
const register = require('./register.validator');
const login = require('./login.validator');
const appointments = require('./appointments.validator');
const userUpdate = require('./userUpdate.validator');
module.exports = {
    register,
    login,
    appointments,
    userUpdate
};