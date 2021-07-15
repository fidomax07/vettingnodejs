const mongoose = require('mongoose');
const logger = require('./config/winston');
const { url, options } = require('./config').mongoose;

// Set default options
mongoose.set('returnOriginal', false);
mongoose.set('runValidators', true);

const connect = (successCB, initialErrorCB, laterErrorsCB) => {
  mongoose
    .connect(url, options)
    .then((dbInstance) => {
      logger.info('Connected to MongoDB.');
      successCB(dbInstance);
    })
    .catch((err) => {
      logger.error('Connection to MongoDB failed.');
      initialErrorCB(err);
    });
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
    laterErrorsCB(err);
  });
};

const connectAsync = async () => {
  const dbInstance = await mongoose.connect(url, options);
  return dbInstance;
};

const disconnect = () => {
  mongoose.disconnect();
};

const disconnectAsync = async () => {
  await mongoose.disconnect();
};

const dbInstance = () => mongoose.connection.db;

const collections = async () => {
  const collectionsArray = dbInstance() ? await dbInstance().listCollections().toArray() : [];
  return collectionsArray;
};

module.exports = {
  connect,
  connectAsync,
  disconnect,
  disconnectAsync,
  dbInstance,
  collections
};
