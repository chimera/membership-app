const Customer = require('../../models/customer')
const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const customer = await Customer.get(req.params.id)
  res.render('customers/detail', { customer: customer })
})
