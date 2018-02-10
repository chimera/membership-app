module.exports = app => {
  app.use('/auth', require('./auth'))
  app.use('/messages', require('./messages'))
  app.use('/customers', require('./customers'))
  app.use('/dashboard', require('./dashboard'))

  // TODO: redirect customer to /customers/their-id
  app.get('/', (req, res) => res.redirect('/dashboard'))
}
