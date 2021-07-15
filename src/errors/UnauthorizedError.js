const httpStatus = require('http-status');
const APIError = require('./APIError');

class UnauthorizedError extends APIError {
  constructor(message) {
    super(message || 'Unauthorized');
    this.statusCode = httpStatus.UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
