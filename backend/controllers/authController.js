const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const { ROLES } = require('../utils/constants')

// build and sign a jwt for the user
const signToken = (user) => {
  // generate token - put the stuff we need in every request here
  const payload = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const login = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password

    console.log('login attempt for:', email)

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = signToken(user)

    // dont send password back obviously
    const userData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      location: user.location,
    }

    return res.json({ success: true, token, user: userData })
  } catch (err) {
    return next(err)
  }
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, location } = req.body

    // check if user already exists first
    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const roleToSave = req.user && req.user.role === ROLES.ADMIN && role ? role : ROLES.EMPLOYEE
    const user = await User.create({ name, email, password, role: roleToSave, phone, department, location })

    // TODO: send welcome email

    AuditLog.create({
      actor: user._id,
      action: 'user-registered',
      targetModel: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    return res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    return next(err)
  }
}

const me = function(req, res, next) {
  User.findById(req.user._id)
    .select('-password')
    .lean()
    .then(function(user) {
      res.json({ success: true, data: { ...user, id: user._id } })
    })
    .catch(next)
}

const updateMe = function(req, res, next) {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true })
    .select('-password')
    .lean()
    .then(function(updated) {
      res.json({ success: true, data: { ...updated, id: updated._id } })
    })
    .catch(next)
}

module.exports = { register, login, me, updateMe }
