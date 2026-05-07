// check if the user has permission to do this
module.exports = function(roles) {
  return function(req, res, next) {
    // console.log('checking role:', req.user.role, 'allowed:', roles)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this' })
    }
    next()
  }
}
