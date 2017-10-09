const config = require('config')
const winston = require('winston')

const ENV = config.get('env')
const LOG_LEVEL = config.get('logLevel')

const transports = [
  new winston.transports.Console({
    level: LOG_LEVEL,
    colorize: ENV === 'development',
    prettyPrint: ENV === 'development',
  }),
]

module.exports = new winston.Logger({ transports })
