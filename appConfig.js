const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

const server = { 
  environment: process.env.ENVIRONMENT
};

const database = {
  dbUserName : process.env.DB_USERNAME,
  dbPassword : process.env.DB_PASSWORD,
  dbName : process.env.DB_NAME,
  dbHost : process.env.DB_HOST,
  dbDialect : process.env.DB_DIALECT,
};

const dbUrl = process.env.DB_URL;
const jwtSecretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  port,
  server,
  database,
  dbUrl,
  jwtSecretKey
};
