function antiMiddleware () {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      console.log("not authenticated but why?");
      return next()
    }
    res.redirect('/')
  }
}

module.exports = antiMiddleware