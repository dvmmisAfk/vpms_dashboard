const jwt = require('jsonwebtoken')
const Appointment = require('../models/Appointment')
const Visitor = require('../models/Visitor')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const sendEmail = require('../utils/sendEmail')
const sendSMS = require('../utils/sendSMS')
const uploadPhotoBuffer = require('../utils/uploadPhotoBuffer')

const createAppointment = async (req, res) => {
  try {
    const hostId = req.body.host || req.user._id
    const host = await User.findById(hostId).lean()

    if (!host) return res.status(400).json({ message: 'Host not found' })

    // create the visitor object first, then the appointment
    const visitor = await Visitor.create({
      name: req.body.visitorName,
      email: req.body.visitorEmail,
      phone: req.body.visitorPhone,
      company: req.body.company,
      purpose: req.body.purpose,
      host: hostId,
      preRegistered: true,
      status: 'pending',
      location: host.location || 'hq'
    })

    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: hostId,
      scheduledAt: req.body.scheduledAt,
      purpose: req.body.purpose,
      notes: req.body.notes,
      status: 'pending'
    })

    // generate pre-registration link for the visitor
    const token = jwt.sign({ appointmentId: appointment._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const link = `${process.env.CLIENT_URL}/pre-register/${token}`

    if (visitor.email) {
      sendEmail({
        to: visitor.email,
        template: 'appointmentConfirmation',
        payload: { visitorName: visitor.name, scheduledAt: appointment.scheduledAt, preRegisterLink: link }
      }).catch(err => console.warn('visitor email failed:', err.message))
    }

    // TODO: send email notification to visitor and host

    sendEmail({
      to: host.email,
      template: 'appointmentReminder',
      payload: { visitorName: visitor.name, scheduledAt: appointment.scheduledAt }
    }).catch(err => console.warn('host email failed:', err.message))

    AuditLog.create({
      actor: req.user._id,
      action: 'APPOINTMENT_CREATED',
      targetModel: 'Appointment',
      targetId: appointment._id.toString(),
      ip: req.ip,
      details: { preRegisterLink: link }
    }).catch(() => {})

    res.status(201).json({ success: true, data: { appointment, visitor, preRegisterLink: link } })
  } catch (err) {
    console.log('createAppointment error:', err)
    res.status(500).json({ message: 'Failed to create appointment' })
  }
}

const listAppointments = async (req, res) => {
  try {
    let filter = {}
    const status = req.query.status
    const host = req.query.host
    const date = req.query.date

    if (status) filter.status = status
    if (host) filter.host = host

    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      filter.scheduledAt = { $gte: start, $lt: end }
    }

    // employees only see their own appointments
    if (req.user.role === 'employee') filter.host = req.user._id

    const items = await Appointment.find(filter)
      .populate('visitor host')
      .sort({ scheduledAt: -1 })
      .lean()

    res.json({ success: true, data: items })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments' })
  }
}

const getAppointment = function(req, res) {
  Appointment.findById(req.params.id)
    .populate('visitor host')
    .lean()
    .then(function(item) {
      if (!item) return res.status(404).json({ message: 'Appointment not found' })
      res.json({ success: true, data: item })
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Something went wrong' })
    })
}

const updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('visitor host')
      .lean()
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment' })
  }
}

const cancelAppointment = function(req, res) {
  Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true })
    .lean()
    .then(function(cancelled) {
      AuditLog.create({
        actor: req.user._id,
        action: 'APPOINTMENT_CANCELLED',
        targetModel: 'Appointment',
        targetId: req.params.id,
        ip: req.ip
      }).catch(() => {})

      res.json({ success: true, data: cancelled })
    })
    .catch(function(err) {
      console.log('cancel error:', err)
      res.status(500).json({ message: 'Something went wrong' })
    })
}

const approveAppointment = async (req, res) => {
  try {
    // appointment approved, now notify people
    const appointment = await Appointment.findById(req.params.id).populate('visitor host').exec()
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })

    appointment.status = 'approved'
    appointment.notificationSent = true
    await appointment.save()

    // also update the visitor status
    await Visitor.findByIdAndUpdate(appointment.visitor._id, { status: 'approved' })

    if (appointment.visitor.email) {
      sendEmail({
        to: appointment.visitor.email,
        template: 'appointmentApproved',
        payload: { visitorName: appointment.visitor.name, scheduledAt: appointment.scheduledAt }
      }).catch(e => console.warn('approval email failed but thats ok:', e.message))
    }

    if (appointment.visitor.phone) {
      sendSMS({ to: appointment.visitor.phone, body: 'Your appointment has been approved.' })
        .catch(e => console.warn('sms failed:', e.message))
    }

    AuditLog.create({
      actor: req.user._id,
      action: 'APPOINTMENT_APPROVED',
      targetModel: 'Appointment',
      targetId: appointment._id.toString(),
      ip: req.ip
    }).catch(() => {})

    res.json({ success: true, data: appointment.toObject() })
  } catch (err) {
    console.log('approveAppointment error:', err)
    res.status(500).json({ message: 'Failed to approve appointment' })
  }
}

const completePreRegistration = async (req, res) => {
  try {
    // check token is valid - it comes from the email link
    let decoded
    try {
      decoded = jwt.verify(req.params.token, process.env.JWT_SECRET)
    } catch (e) {
      return res.status(400).json({ message: 'Link is invalid or has expired' })
    }

    const appointment = await Appointment.findById(decoded.appointmentId)
      .populate('visitor host')
      .exec()

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    // update visitor fields with what they submitted in the form
    if (req.body.name) appointment.visitor.name = req.body.name
    if (req.body.phone) appointment.visitor.phone = req.body.phone
    if (req.body.company) appointment.visitor.company = req.body.company

    // upload photo if one was attached
    if (req.file) {
      const photoUrl = await uploadPhotoBuffer(req.file.buffer)
      appointment.visitor.photoUrl = photoUrl
    }

    await appointment.visitor.save()

    AuditLog.create({
      actor: appointment.host._id,
      action: 'APPOINTMENT_PRE_REGISTERED',
      targetModel: 'Visitor',
      targetId: appointment.visitor._id.toString(),
      ip: req.ip
    }).catch(() => {})

    res.json({ success: true, data: appointment.toObject() })
  } catch (err) {
    console.log('pre-registration error:', err)
    res.status(500).json({ message: 'Failed to complete registration' })
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  completePreRegistration
}
