const express = require("express");
const bodyParser = require("body-parser");
const httpStatus = require("./src/utils/httpStatus");
const cors = require('cors');

const app = express();

const environment = process.env.NODE_ENV;

// configure the app to use cors
app.use(cors());

// configure the app to use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (environment !== "production") {
  // configure the app to dot env to load env variable to app
  require('dotenv').config();

  // configure the app to use morgan
  const morgan = require("morgan");
  app.use(morgan('dev'));
}

require("./config/db");

app.get('/api/v1', (req, res) => {
  res.status(httpStatus.OK).send('API v1 running');
});

const authController = require('./src/controllers/authController');
app.use('/api/v1/authentication', authController);


module.exports = app;
