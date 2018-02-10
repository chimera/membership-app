const Customer = require('../../models/customer')
const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const { member, search } = req.query
  const customers = await Customer.find({
    search,
    filter: { member },
  })
  res.render('customers/list', { customers, member, search })
})
