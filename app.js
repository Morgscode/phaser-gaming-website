const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./app/utils/errorHandler');
const gamesRouter = require('./app/routes/gameRoutes');

const app = express();

// if we're in dev env
if (process.env.NODE_ENV === 'development') {
  //bring in logging
  app.use(morgan('dev'));
}

// compress assests
app.use(compression());

// serve static content from the public directory
app.use(express.static(path.join(`${__dirname}/public`)));

//bring in game routes
app.use('/games/', gamesRouter);

// bring in the error handler
app.use(errorHandler.handleError);

// set the root route response
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/theme/homepage.html`));
});

// set the default 404 route
app.all('*', (req, res, next) => {
  // lets create a new error
  const error = new Error(`Cannot find ${req.params.game}`);
  error.status = 'fail - game not found';
  error.statusCode = 404;
  // lets call the next middleware in the stack
  next(error);
});

// lets make the app available to the server
module.exports = app;
