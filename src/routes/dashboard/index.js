// const Customer = require('../../models/customer')
const express = require('express')
const wrap = require('express-async-wrapper')

const router = express.Router()

router.get(
  '/',
  wrap(async (req, res) => {
    // const customer = await Customer.get(req.params.id)
    res.render('dashboard/index', {})
  })
)

module.exports = router
