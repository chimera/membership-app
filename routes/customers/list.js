const Customer = require('../../models/customer')
const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const customers = await Customer.find({})
  res.render('customers/list', { customers })
})
