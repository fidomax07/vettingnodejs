const { unexpectedErrorHandler, terminationHandler } = require('./utils/error-handler');
const db = require('./db');
const app = require('./app');

let server;
db.connect(() => {
  server = app.startServer();
}, unexpectedErrorHandler);

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGINT', () => terminationHandler('SIGINT', server));
process.on('SIGTERM', () => terminationHandler('SIGTERM', server));
