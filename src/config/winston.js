const w = require('winston');
const { inDevelopment } = require('./server');

const errorStacksFormat = w.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = w.createLogger({
  level: inDevelopment ? 'debug' : 'info',
  format: w.format.combine(
    errorStacksFormat(),
    w.format.colorize(),
    w.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [new w.transports.Console()]
});

module.exports = logger;
