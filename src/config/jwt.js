require('dotenv').config();

const jwt = {
  secret: process.env.JWT_SECRET
};

module.exports = jwt;
