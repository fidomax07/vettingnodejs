require('dotenv').config();
const { inTesting } = require('./server');

const mongoose = {
  url: process.env.MONGODB_URL + (inTesting ? '-test' : ''),
  options: {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true
  }
};

module.exports = mongoose;
