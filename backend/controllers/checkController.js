// controllers/checkController.js
const CheckLog = require('../models/CheckLog')
const Pass = require('../models/Pass')
const Visitor = require('../models/Visitor')
const AuditLog = require('../models/AuditLog')
const sendSMS = require('../utils/sendSMS')
const { VISITOR_STATUSES, ROLES } = require('../utils/constants')
const { MESSAGES } = require('../utils/messages')
const { sendIfValidationErrors } = require('../utils/validateRequest')

const checkIn = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return

    const { passCode } = req.body

    // step 1: find the pass and make sure its valid
    const pass = await Pass.findOne({ passCode, isActive: true })
      .populate('visitor appointment')
      .lean()

    if (!pass || new Date() < new Date(pass.validFrom) || new Date() > new Date(pass.validUntil)) {
      return res.status(400).json({ success: false, message: MESSAGES.passInvalid })
    }

    const location = req.user.role === ROLES.SECURITY ? req.user.location : req.body.location || pass.location

    // step 2: update visitor status
    await Visitor.findByIdAndUpdate(pass.visitor._id, { status: VISITOR_STATUSES.CHECKED_IN }).lean()

    // step 3: create the log entry
    const logEntry = await CheckLog.create({
      visitor: pass.visitor._id,
      pass: pass._id,
      action: 'check-in',
      scannedBy: req.user._id,
      location,
      notes: req.body.notes || '',
      timestamp: new Date(),
    })

    if (pass.visitor.phone) {
      sendSMS({
        to: pass.visitor.phone,
        body: `${MESSAGES.smsCheckInConfirmedPrefix} ${pass.visitor.name} ${MESSAGES.smsCheckInConfirmedSuffix} ${location}.`,
      }).catch(e => console.warn('sms failed:', e.message))
    }

    AuditLog.create({
      actor: req.user._id,
      action: 'check-in',
      targetModel: 'Visitor',
      targetId: pass.visitor._id.toString(),
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    // emit socket event so dashboard updates in real time
    const io = req.app.get('io')
    if (io) io.emit('check-event', { event: 'check-in', passCode, visitor: pass.visitor.name, location })

    const responseLog = await CheckLog.findById(logEntry._id).populate('visitor scannedBy').lean()
    return res.status(201).json({ success: true, data: responseLog })
  } catch (err) {
    return next(err)
  }
}

const checkOut = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return

    const { passCode } = req.body
    const pass = await Pass.findOne({ passCode, isActive: true })
      .populate('visitor appointment')
      .lean()

    if (!pass || new Date() > new Date(pass.validUntil)) {
      return res.status(400).json({ success: false, message: MESSAGES.passInvalid })
    }

    const location = req.user.role === ROLES.SECURITY ? req.user.location : req.body.location || pass.location

    await Visitor.findByIdAndUpdate(pass.visitor._id, { status: VISITOR_STATUSES.CHECKED_OUT }).lean()

    const logEntry = await CheckLog.create({
      visitor: pass.visitor._id,
      pass: pass._id,
      action: 'check-out',
      scannedBy: req.user._id,
      location,
      notes: req.body.notes || '',
      timestamp: new Date(),
    })

    AuditLog.create({
      actor: req.user._id,
      action: 'check-out',
      targetModel: 'Visitor',
      targetId: pass.visitor._id.toString(),
      ip: req.ip,
    }).catch(e => console.warn('audit log failed:', e.message))

    const io = req.app.get('io')
    if (io) io.emit('check-event', { event: 'check-out', passCode, visitor: pass.visitor.name, location })

    const responseLog = await CheckLog.findById(logEntry._id).populate('visitor scannedBy').lean()
    return res.status(201).json({ success: true, data: responseLog })
  } catch (err) {
    return next(err)
  }
}

const listLogs = function(req, res, next) {
  if (sendIfValidationErrors(req, res)) return

  let filter = {}
  const location = req.user.role === ROLES.SECURITY ? req.user.location : null

  if (location) filter.location = location
  if (req.query.action) filter.action = req.query.action
  if (req.query.visitor) filter.visitor = req.query.visitor

  // this works but its kinda ugly, will refactor later
  if (req.query.today === 'true') {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    filter.timestamp = { $gte: todayStart }
  } else if (req.query.start || req.query.end) {
    filter.timestamp = {}
    if (req.query.start) filter.timestamp.$gte = new Date(req.query.start)
    if (req.query.end) filter.timestamp.$lte = new Date(req.query.end)
  }

  CheckLog.find(filter)
    .populate('visitor pass scannedBy')
    .sort({ timestamp: -1 })
    .lean()
    .then(function(items) {
      res.json({ success: true, data: items })
    })
    .catch(next)
}

module.exports = { checkIn, checkOut, listLogs }
