const moment = require('moment')

module.exports = function templateHelpers() {
  return (req, res, next) => {
    res.locals.moment = moment
    next()
  }
}
