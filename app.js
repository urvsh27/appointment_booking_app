// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const status = require('express-status-monitor');
const fileUpload = require('express-fileupload');

// Import files
const appConfig = require('./appConfig');
const { successObjectResponse } = require('./utils/response');
const indexRoutes = require('./routes/index');
const { generalMessages } = require('./utils/messages');

const db = require('./models');

// Rest object
const app = express();

// Cors
app.use(cors());
// Express status monitor
app.use(status());

// Configure bodyParser for parsing JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer
app.use(fileUpload());

// Create a Sequelize instance based on your configuration
const sequelize = new Sequelize({
  database: appConfig.database.dbName,
  username: appConfig.database.dbUserName,
  password: appConfig.database.dbPassword,
  host: appConfig.database.dbHost,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: {
      require: true,
      // Add the 'sslmode' option
      sslmode: 'require',
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log(generalMessages.dbConnectionSuccess);
    db.sequelize
      .sync()
      .then(() => {
        console.log(generalMessages.dbSyncSuccess);
      })
      .catch((error) => {
        console.log('Error message : ', error.message);
      });
  })
  .catch((error) => {
    console.log(generalMessages.dbConnectionFail, error);
  });

// Add routes after body parser
// Routes
app.use('/', indexRoutes);
// Test the database connection

app.get('/', (req, res) => {
  let successObjectRes = successObjectResponse;
  successObjectRes.message = generalMessages.welcomeMessage;
  res.send(successObjectRes);
});

app.listen(appConfig.port, () => {
  console.log(`Server running on ${appConfig.port}`);
});
