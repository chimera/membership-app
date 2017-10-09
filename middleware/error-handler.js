const logger = require('../lib/logger')

module.exports = function errorHandlerMiddleware() {
  return (error, req, res, next) => {
    res.status(500)

    logger.log('error', '[errorHanlder] Error:', error)

    // respond with html page
    if (req.accepts('html')) {
      return res.render('500', { error, url: req.url })
    }

    // respond with json
    if (req.accepts('json')) {
      return res.send({ error: err.message, status: 500 })
    }

    // default to plain-text. send()
    res.type('txt').send('Server Error!')
  }
}
