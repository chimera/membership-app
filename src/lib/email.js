const config = require('config')
const logger = require('./logger')

const DEFAULT_FROM_EMAIL = config.get('defaultFromEmail')

function email({ to, from = DEFAULT_FROM_EMAIL, subject, body }) {
  return new Promise((resolve, reject) => {
    logger.log('info', `Sending email ${subject} from ${from}.`, { to, body })
    resolve()
  })
}

module.exports = email
