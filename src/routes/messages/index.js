const express = require('express')

const router = express.Router()

router.get('/new', require('./new'))
router.post('/', require('./create'))

module.exports = router
