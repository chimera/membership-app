const bodyParser = require('body-parser')
const config = require('config')
const currentUser = require('./current-user')
const Customer = require('../models/customer')
const express = require('express')
const flash = require('express-flash')
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')
const session = require('express-session')
const templateHelpers = require('./template-helpers')

const SESSION_SECRET = config.get('sessionSecret')

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const customer = await Customer.findByEmail(email)

        if (!customer) {
          return done(null, false, { message: 'Incorrect email.' })
        }
        if (!customer.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' })
        }

        return done(null, customer)
      } catch (error) {
        console.error(error)
        return done(error)
      }
    }
  )
)

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

module.exports = app => {
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(session({ secret: SESSION_SECRET }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
  app.use(templateHelpers())
  app.use(currentUser())
}
