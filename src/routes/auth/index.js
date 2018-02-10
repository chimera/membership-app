const express = require('express')
const passport = require('passport')

const router = express.Router()

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
)
router.get('/login', (req, res) => res.render('auth/login', {}))
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
