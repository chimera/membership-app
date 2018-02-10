module.exports = () => {
  return (req, res, next) => {
    res.locals.currentUser = req.user
    next()
  }
}
