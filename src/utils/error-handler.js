const httpStatus = require('http-status');
const DbValidationError = require('mongoose').Error.ValidationError;
const db = require('../db');
const logger = require('../config/winston');
const APIError = require('../errors/APIError');
const { inDevelopment } = require('../config/server');
const NotFoundError = require('../errors/NotFoundError');
const RequestValidationError = require('../errors/RequestValidationError');

const notFoundErrorHandler = (req, res, next) => {
  next(new NotFoundError('Endpoint not found.'));
};

const defaultErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof APIError) {
    return res.status(err.statusCode).send({ error: err.message });
  }

  if (err instanceof DbValidationError || err instanceof RequestValidationError) {
    res.status(err.statusCode || httpStatus.UNPROCESSABLE_ENTITY);
    return res.send({ errors: inDevelopment ? err.errors : err.message });
  }

  const message = inDevelopment ? err.message : 'Internal Server Error';
  res.locals.errorMessage = message;
  res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  res.send({ error: message });
};

const unexpectedErrorHandler = (err) => {
  logger.error(err);
  db.disconnect();
  process.exit(1);
};

const terminationHandler = (signal, server) => {
  logger.info(`${signal} received. Terminating gracefully. ${new Date().toLocaleTimeString()}`);
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exitCode = 1;
    }
    process.exit();
  });
};

module.exports = {
  notFoundErrorHandler,
  defaultErrorHandler,
  unexpectedErrorHandler,
  terminationHandler
};
