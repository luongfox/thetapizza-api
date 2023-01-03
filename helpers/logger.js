import * as winston from 'winston';

export default class Logger {

  static #client = null;

  static setup() {
    this.#client = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({ filename: 'storage/logs/debug.log' }),
      ],
    });
  }

  static log(level, message) {
    this.#client.log({
      level: level,
      message: message
    });
  }

  static info(message) {
    this.log('info', message);
  }

  static debug(message) {
    this.log('debug', message);
  }

  static error(message) {
    this.log('error', message);
  }
}
