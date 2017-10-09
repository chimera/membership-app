const Customer = require('../../models/customer')
const wrap = require('express-async-wrapper')

module.exports = wrap(async (req, res) => {
  const body = req.body
  console.log(body)

  const fields = {
    description: body.description,
    email: body.email,
    metadata: {
      interests: body.interests,
      rfids: body.rfids,
      signoffs: body.signoffs,
      phone: body.phone,
    },
  }

  const customer = await Customer.update(req.params.id, fields)

  req.flash('success', 'Updated successfully')
  res.redirect(`/customers/${req.params.id}`)
  // res.render('customers/edit', { customer: customer })
})
