const Visitor = require('../models/Visitor')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const uploadPhotoBuffer = require('../utils/uploadPhotoBuffer')
const { sendIfValidationErrors } = require('../utils/validateRequest')
const { VISITOR_STATUSES, ROLES } = require('../utils/constants')
const { MESSAGES } = require('../utils/messages')

const createVisitor = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return

    // make sure we have the required stuff
    const payload = { ...req.body }

    const hostDoc = await User.findById(payload.host).lean()
    payload.location = payload.location || hostDoc?.location || 'hq'

    // upload to cloudinary if photo provided
    if (req.file) payload.photoUrl = await uploadPhotoBuffer(req.file.buffer)

    const visitor = await Visitor.create(payload)

    AuditLog.create({
      actor: req.user._id,
      action: 'visitor-created',
      targetModel: 'Visitor',
      targetId: visitor._id.toString(),
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    const leanVisitor = await Visitor.findById(visitor._id).populate('host', 'name email location').lean()
    return res.status(201).json({ success: true, data: leanVisitor })
  } catch (err) {
    return next(err)
  }
}

const listVisitors = async (req, res, next) => {
  try {
    // build filter step by step
    let filter = { isActive: true }

    // search by name or email
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { email: { $regex: req.query.q, $options: 'i' } },
        { company: { $regex: req.query.q, $options: 'i' } },
      ]
    }

    if (req.query.status) filter.status = req.query.status

    // security staff only see their location
    if (req.user.role === ROLES.SECURITY) {
      filter.location = req.user.location
    }

    console.log('fetching visitors with filter:', filter)

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Visitor.find(filter).populate('host', 'name email location').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Visitor.countDocuments(filter),
    ])

    return res.json({ success: true, data: items, meta: { total, page, limit } })
  } catch (err) {
    return next(err)
  }
}

const getVisitor = async (req, res, next) => {
  try {
    const item = await Visitor.findById(req.params.id).populate('host', 'name email location').lean()
    if (!item) return res.status(404).json({ success: false, message: MESSAGES.visitorNotFound })

    if (req.user.role === ROLES.SECURITY && item.location !== req.user.location) {
      return res.status(403).json({ success: false, message: MESSAGES.forbidden })
    }

    return res.json({ success: true, data: item })
  } catch (err) {
    return next(err)
  }
}

const updateVisitor = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return
    const updated = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('host', 'name email location').lean()
    return res.json({ success: true, data: updated })
  } catch (err) {
    return next(err)
  }
}

const removeVisitor = async (req, res, next) => {
  try {
    // soft delete - just mark as inactive
    const updated = await Visitor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean()

    AuditLog.create({
      actor: req.user._id,
      action: 'visitor-deleted',
      targetModel: 'Visitor',
      targetId: req.params.id,
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    return res.json({ success: true, data: updated })
  } catch (err) {
    return next(err)
  }
}

const approveVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: VISITOR_STATUSES.APPROVED }, { new: true }).populate('host', 'name email').lean()

    AuditLog.create({
      actor: req.user._id,
      action: 'visitor-approved',
      targetModel: 'Visitor',
      targetId: req.params.id,
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    return res.json({ success: true, data: visitor })
  } catch (err) {
    return next(err)
  }
}

// rewrote this one to use promise chain, was having a weird bug with the async version
const rejectVisitor = function(req, res, next) {
  Visitor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true })
    .populate('host', 'name email')
    .lean()
    .then(function(visitor) {
      AuditLog.create({
        actor: req.user._id,
        action: 'visitor-rejected',
        targetModel: 'Visitor',
        targetId: req.params.id,
        ip: req.ip,
      }).catch(e => console.warn('audit log failed:', e.message))

      res.json({ success: true, data: visitor })
    })
    .catch(next)
}

module.exports = { createVisitor, listVisitors, getVisitor, updateVisitor, removeVisitor, approveVisitor, rejectVisitor }
