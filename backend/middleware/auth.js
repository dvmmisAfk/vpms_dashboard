const jwt = require('jsonwebtoken')
const User = require('../models/User')

// check if user is logged in
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''

    // token comes after "Bearer " so we split on space
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }

    // not sure why we need to pass process.env.JWT_SECRET again here but it breaks without it
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // attach user to request so other routes can use it
    const user = await User.findById(decoded.id).select('-password').lean()
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is not valid' })
  }
}

module.exports = auth
