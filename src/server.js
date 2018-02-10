const config = require('config')
const chalk = require('chalk')
const exceptionHandling = require('./middleware/exception-handling')
const express = require('express')
const path = require('path')
const routes = require('./routes')
const middleware = require('./middleware')

const app = express()
const PORT = config.get('port')

app.set('views', path.join(process.cwd(), 'src', 'views'))
app.set('view engine', 'pug')

middleware(app)
routes(app)
exceptionHandling(app)

app.listen(PORT, () => {
  console.log('\n')
  console.log(
    chalk.green.bold('App listening on port'),
    chalk.blue.underline(PORT)
  )
})
