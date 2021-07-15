require('dotenv').config();

const server = {
  /**
   * @type {Number}
   */
  port: process.env.PORT,

  /**
   * @type {boolean}
   */
  inDevelopment: process.env.NODE_ENV === 'development',

  /**
   * @type {boolean}
   */
  inTesting: process.env.NODE_ENV === 'test'
};

module.exports = server;
