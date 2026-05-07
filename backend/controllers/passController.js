const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')
const Pass = require('../models/Pass')
const Visitor = require('../models/Visitor')
const User = require('../models/User')
const generatePDF = require('../utils/generatePDF')
const sendEmail = require('../utils/sendEmail')
const AuditLog = require('../models/AuditLog')

// generates a QR pass for a visitor
const generatePass = async (req, res) => {
  try {
    // make sure visitor exists
    const visitor = await Visitor.findById(req.params.visitorId).lean()
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' })
    }

    console.log('generating pass for visitor:', visitor.name)

    // get host info for the pdf badge
    const host = await User.findById(visitor.host).select('name email').lean()
    const hostName = host ? host.name : 'N/A'

    // uuid gives a random unique string to use as the pass code
    const passCode = uuidv4()

    // generate QR code as base64 image
    const qrData = await QRCode.toDataURL(passCode)

    // try to generate a pdf badge - its optional so dont fail if it breaks
    let pdfUrl = null
    try {
      pdfUrl = await generatePDF({
        visitor: visitor,
        hostName: hostName,
        passCode: passCode,
        validFrom: req.body.validFrom,
        validUntil: req.body.validUntil,
        qrCodeData: qrData
      })
    } catch (pdfErr) {
      // pdf failing is not a blocker - pass still works without it
      console.log('pdf generation failed (cloudinary probably not configured):', pdfErr.message)
    }

    // if visitor already has a pass, deactivate it before creating new one
    const existingPasses = await Pass.find({ visitor: visitor._id, isActive: true })
    for (let i = 0; i < existingPasses.length; i++) {
      existingPasses[i].isActive = false
      await existingPasses[i].save()
    }

    // save the new pass
    const newPass = await Pass.create({
      visitor: visitor._id,
      appointment: req.body.appointment || undefined,
      passCode: passCode,
      qrCodeData: qrData,
      pdfUrl: pdfUrl,
      validFrom: req.body.validFrom,
      validUntil: req.body.validUntil,
      issuedBy: req.user._id,
      location: visitor.location || 'hq'
    })

    // update visitor status to approved
    await Visitor.findByIdAndUpdate(visitor._id, { status: 'approved' })

    // send email if visitor has one
    if (visitor.email) {
      sendEmail({
        to: visitor.email,
        template: 'passIssued',
        payload: { visitorName: visitor.name, passCode: passCode, pdfUrl: pdfUrl }
      }).catch(function(err) {
        console.log('email send failed:', err.message)
      })
    }

    AuditLog.create({
      actor: req.user._id,
      action: 'PASS_ISSUED',
      targetModel: 'Pass',
      targetId: newPass._id.toString(),
      ip: req.ip
    }).catch(() => {})

    // emit socket event for dashboard real-time update
    const io = req.app.get('io')
    if (io) {
      io.emit('check-event', { event: 'pass-issued', passCode: passCode })
    }

    // fetch the pass again with visitor info populated for the response
    const passWithVisitor = await Pass.findById(newPass._id)
      .populate('visitor', 'name email photoUrl company purpose status')
      .lean()

    res.status(201).json({ success: true, data: passWithVisitor })
  } catch (err) {
    console.log('generatePass error:', err)
    res.status(500).json({ message: 'Failed to generate pass' })
  }
}

const listPasses = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === 'security') filter.location = req.user.location

    if (req.query.visitor === 'me') {
      const visitorProfile = await Visitor.findOne({ email: req.user.email }).lean()
      if (visitorProfile) filter.visitor = visitorProfile._id
    } else if (req.query.visitor) {
      filter.visitor = req.query.visitor
    }

    const items = await Pass.find(filter)
      .populate('visitor issuedBy')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, data: items })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch passes' })
  }
}

const myPass = async (req, res) => {
  try {
    const visitorProfile = await Visitor.findOne({ email: req.user.email }).lean()
    if (!visitorProfile) return res.json({ success: true, data: null })

    // get the most recent pass
    const passes = await Pass.find({ visitor: visitorProfile._id })
      .sort({ createdAt: -1 })
      .populate('visitor')
      .lean()

    res.json({ success: true, data: passes[0] || null })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pass' })
  }
}

const getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).populate('visitor appointment').lean()
    if (!pass) return res.status(404).json({ message: 'Pass not found' })
    res.json({ success: true, data: pass })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pass' })
  }
}

// used by the scanner to check if a pass is valid
const verifyPass = function(req, res) {
  Pass.findOne({ passCode: req.params.passCode, isActive: true })
    .populate({ path: 'visitor', populate: { path: 'host', select: 'name email' } })
    .populate('appointment')
    .lean()
    .then(function(pass) {
      // not sure why i need to do this check separately but it works
      if (!pass) return res.status(404).json({ message: 'Pass not found or inactive' })
      res.json({ success: true, data: pass })
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Verify failed' })
    })
}

const deactivatePass = async (req, res) => {
  try {
    const existing = await Pass.findById(req.params.id).lean()
    if (!existing) return res.status(404).json({ message: 'Pass not found' })

    const pass = await Pass.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean()

    AuditLog.create({
      actor: req.user._id,
      action: 'PASS_DEACTIVATED',
      targetModel: 'Pass',
      targetId: req.params.id,
      ip: req.ip
    }).catch(() => {})

    res.json({ success: true, data: pass })
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate pass' })
  }
}

module.exports = { generatePass, listPasses, myPass, getPass, verifyPass, deactivatePass }
