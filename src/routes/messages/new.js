const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const emails = req.query.emails ? req.query.emails.split(',') : []
  res.render('messages/new', { emails: emails })
})
