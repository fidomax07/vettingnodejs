const httpStatus = require('http-status');

class RequestValidationError extends Error {
  constructor(errors) {
    super();
    this._message = JSON.stringify(errors);
    this.errors = errors;
    this.statusCode = httpStatus.UNPROCESSABLE_ENTITY;
  }

  get message() {
    try {
      return JSON.parse(this._message);
    } catch (err) {
      return 'Validation failed.';
    }
  }
}

module.exports = RequestValidationError;
