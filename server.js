const bodyParser = require('body-parser')
const config = require('config')
const customers = require('./routes/customers')
const errorHandler = require('./middleware/error-handler')
const express = require('express')
const flash = require('express-flash')
const messages = require('./routes/messages')
const notFound = require('./middleware/not-found')
const path = require('path')
const session = require('express-session')

const app = express()
const PORT = config.get('port')
const SESSION_SECRET = config.get('sessionSecret')

// Setup middleware
app.set('views', path.join(process.cwd(), 'views'))
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET }))
app.use(flash())
app.use(function(req, res, next) {
  res.locals.moment = require('moment')
  next()
})

// Setup routes
app.use('/messages', messages)
app.use('/customers', customers)
app.get('/', (req, res) => res.redirect('/customers'))

// Exception handling
app.use(notFound())
app.use(errorHandler())

// Run server
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
