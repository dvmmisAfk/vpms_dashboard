// controllers/checkController.js
const CheckLog = require("../models/CheckLog");
const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");
const sendSMS = require("../utils/sendSMS");
const createAuditLog = require("../utils/auditLog");
const { VISITOR_STATUSES, CHECK_ACTIONS, ROLES, AUDIT_ACTIONS } = require("../utils/constants");
const { MESSAGES } = require("../utils/messages");
const { emitCheckEvent } = require("../utils/socketEmit");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const checkIn = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const { passCode } = req.body;
    const pass = await Pass.findOne({
      passCode,
      isActive: true,
    })
      .populate("visitor appointment")
      .lean();

    if (!pass || new Date() < new Date(pass.validFrom) || new Date() > new Date(pass.validUntil)) {
      return res.status(400).json({ success: false, message: MESSAGES.passInvalid });
    }

    const location = req.user.role === ROLES.SECURITY ? req.user.location : req.body.location || pass.location;

    await Visitor.findByIdAndUpdate(pass.visitor._id, {
      status: VISITOR_STATUSES.CHECKED_IN,
    }).lean();

    const logEntry = await CheckLog.create({
      visitor: pass.visitor._id,
      pass: pass._id,
      action: CHECK_ACTIONS.CHECK_IN,
      scannedBy: req.user._id,
      location,
      notes: req.body.notes || "",
      timestamp: new Date(),
    });

    if (pass.visitor.phone) {
      await sendSMS({
        to: pass.visitor.phone,
        body: `${MESSAGES.smsCheckInConfirmedPrefix} ${pass.visitor.name} ${MESSAGES.smsCheckInConfirmedSuffix} ${location}.`,
      });
    }

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.CHECK_IN,
      targetModel: "Visitor",
      targetId: pass.visitor._id.toString(),
    });

    emitCheckEvent(req, { event: CHECK_ACTIONS.CHECK_IN, passCode, visitor: pass.visitor.name, location });

    const responseLog = await CheckLog.findById(logEntry._id).populate("visitor scannedBy").lean();

    return res.status(201).json({ success: true, data: responseLog });
  } catch (error) {
    return next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const { passCode } = req.body;
    const pass = await Pass.findOne({
      passCode,
      isActive: true,
    })
      .populate("visitor appointment")
      .lean();

    if (!pass || new Date() > new Date(pass.validUntil))
      return res.status(400).json({ success: false, message: MESSAGES.passInvalid });

    const location = req.user.role === ROLES.SECURITY ? req.user.location : req.body.location || pass.location;

    await Visitor.findByIdAndUpdate(pass.visitor._id, {
      status: VISITOR_STATUSES.CHECKED_OUT,
    }).lean();

    const logEntry = await CheckLog.create({
      visitor: pass.visitor._id,
      pass: pass._id,
      action: CHECK_ACTIONS.CHECK_OUT,
      scannedBy: req.user._id,
      location,
      notes: req.body.notes || "",
      timestamp: new Date(),
    });

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.CHECK_OUT,
      targetModel: "Visitor",
      targetId: pass.visitor._id.toString(),
    });

    emitCheckEvent(req, { event: CHECK_ACTIONS.CHECK_OUT, passCode, visitor: pass.visitor.name, location });

    const responseLog = await CheckLog.findById(logEntry._id).populate("visitor scannedBy").lean();

    return res.status(201).json({ success: true, data: responseLog });
  } catch (error) {
    return next(error);
  }
};

const listLogs = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const { action, visitor, start, end } = req.query;
    const filter = {};

    const location = req.user.role === ROLES.SECURITY ? req.user.location : null;
    if (location) filter.location = location;
    if (action) filter.action = action;
    if (visitor) filter.visitor = visitor;
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }

    const items = await CheckLog.find(filter).populate("visitor pass scannedBy").sort({ timestamp: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

module.exports = { checkIn, checkOut, listLogs };
