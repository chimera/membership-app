const express = require('express')

const router = express.Router()

router.get('/:id/edit', require('./edit'))
router.post('/:id', require('./update'))
router.get('/:id', require('./detail'))
router.get('/', require('./list'))

module.exports = router
