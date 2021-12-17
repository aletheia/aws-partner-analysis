import {createLogger, format, transports, Logger as WLogger} from 'winston';

const {combine, splat, timestamp, printf} = format;

const myFormat = printf(({level, message, timestamp, ...metadata}) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (metadata) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

export class Logger {
  private logger: WLogger;

  constructor(config?: {level: string; file?: string}) {
    config = config || {level: 'info'};
    const {level} = config;
    let {file} = config;
    file = file || 'log.log';

    this.logger = createLogger({
      level,
      format: combine(format.colorize(), splat(), timestamp(), myFormat),
      transports: [new transports.File({filename: file})],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.simple(),
        })
      );
    }
  }

  log(message: string, level = 'info') {
    this.logger.log(level, message);
  }
  debug(message: string) {
    this.logger.debug(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}
