const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  console.log(req.body)
  const emails = req.body.emails.split(',').map(e => e.trim())
  console.log('EMAILS', emails)
  req.flash('success', 'Members emailed!')
  res.redirect('/')
})
