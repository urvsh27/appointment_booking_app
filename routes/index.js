// Import modules
const express = require('express');

// Import controllers
const usersController = require('../controllers/usersController');
const authController = require('../middlewares/auth');
const appointmentsController = require('../controllers/appointmentsController');

// Import files
const validator = require('../middlewares/validator');
// Router object
const router = express.Router();

/*
* Authentication routes
*/
// Register route
router.post('/register', validator('register'), usersController.register);
// Register route
router.post('/login', validator('login'), usersController.login);

/*
* Appointments routes
*/
// Dashboard
router.get('/dashboard', authController.jwtUserAuthValidate, appointmentsController.dashboard);
// Book appointment
router.post('/book-appointment', authController.jwtUserAuthValidate, validator('appointments'), appointmentsController.bookAppointment);
// Get appointments
router.get('/appointments', authController.jwtUserAuthValidate, appointmentsController.getUserAppointments);

/*
* Users routes
*/
router.get('/users', authController.jwtUserAuthValidate, usersController.getAllUsers);

module.exports = router;
