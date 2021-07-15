const httpStatus = require('http-status');
const APIError = require('./APIError');

class InvalidOperationError extends APIError {
  constructor(message) {
    super(message || 'Invalid Operation');
    this.statusCode = httpStatus.FORBIDDEN;
  }
}

module.exports = InvalidOperationError;
