const httpStatus = require('http-status');
const APIError = require('./APIError');

class NotFoundError extends APIError {
  constructor(message) {
    super(message || 'Not found.');
    this.statusCode = httpStatus.NOT_FOUND;
  }
}

module.exports = NotFoundError;
