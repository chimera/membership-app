const email = require('../../lib/email')
const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const { body, subject, emails } = req.body

  const to = req.body.emails.split(',').map(e => e.trim())

  await email({ to, subject, body })

  req.flash(
    'success',
    `Email "${subject}" sent to ${to.length} customer${to.length ? 's' : ''}.`
  )
  res.redirect('/')
})
