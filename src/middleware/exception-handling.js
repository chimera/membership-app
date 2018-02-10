const notFound = require('./not-found')
const errorHandler = require('./error-handler')

module.exports = app => {
  app.use(notFound())
  app.use(errorHandler())
}
