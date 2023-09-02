// Import modules
const express = require('express');

// Import controllers
const usersController = require('../controllers/usersController');

// Import files
const validator = require('../middlewares/validator');
// Router object
const router = express.Router();

/*
* Authentication routes
*/
// Register route
router.post('/register',validator('register'), usersController.register);


module.exports = router;
