const express = require('express');
const routes = require('./routes');
const logger = require('./config/winston');
const { port } = require('./config/server');
const errorHandler = require('./utils/error-handler');

// Create the application instance
const app = express();

// Handle parsing JSON request body
app.use(express.json());

// Handle parsing Url-Encoded request body
app.use(express.urlencoded({ extended: false }));

// Bind API routes
app.use(routes);

// Handle unknown API requests
app.use(errorHandler.notFoundErrorHandler);

// Bind default error handler
app.use(errorHandler.defaultErrorHandler);

// Helper function to start listening
app.startServer = () => {
  return app.listen(port, () => logger.info(`Listening on port ${port}`));
};

module.exports = app;
