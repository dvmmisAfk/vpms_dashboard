// controllers/passController.js
const { v4: uuidv4 } = require("uuid");
const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");
const User = require("../models/User");
const generateQR = require("../utils/generateQR");
const generatePDF = require("../utils/generatePDF");
const sendEmail = require("../utils/sendEmail");
const createAuditLog = require("../utils/auditLog");
const { CHECK_ACTIONS, AUDIT_ACTIONS, ROLES } = require("../utils/constants");
const { MESSAGES } = require("../utils/messages");
const { emitCheckEvent } = require("../utils/socketEmit");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const generatePass = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const visitorId = req.params.visitorId;
    const visitor = await Visitor.findById(visitorId).lean();
    if (!visitor) return res.status(404).json({ success: false, message: MESSAGES.visitorNotFound });

    if (req.user.role === ROLES.SECURITY && visitor.location !== req.user.location) {
      return res.status(403).json({ success: false, message: MESSAGES.forbidden });
    }

    const host = await User.findById(visitor.host).select("name email phone").lean();

    const passCode = uuidv4();
    const qrCodeData = await generateQR(passCode);

    let pdfUrl = "";
    try {
      pdfUrl = await generatePDF({
        visitor,
        hostName: host?.name,
        passCode,
        validFrom: req.body.validFrom,
        validUntil: req.body.validUntil,
        qrCodeData,
      });
    } catch (pdfError) {
      pdfUrl = "";
    }

    const passPayload = {
      visitor: visitor._id,
      appointment: req.body.appointment || undefined,
      passCode,
      qrCodeData,
      pdfUrl,
      validFrom: req.body.validFrom,
      validUntil: req.body.validUntil,
      issuedBy: req.user._id,
      location: visitor.location || req.user.location || "hq",
    };

    await Pass.deleteMany({
      visitor: visitor._id,
      isActive: true,
      location: passPayload.location,
    });

    const pass = await Pass.create(passPayload);

    if (visitor.email) {
      await sendEmail({
        to: visitor.email,
        template: "passIssued",
        payload: { visitorName: visitor.name, passCode: pass.passCode, pdfUrl },
      });
    }

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.PASS_ISSUED,
      targetModel: "Pass",
      targetId: pass._id.toString(),
    });

    emitCheckEvent(req, { event: CHECK_ACTIONS.CHECK_IN, passCode });

    const leanPass = await Pass.findById(pass._id).populate("visitor", "name email photoUrl company purpose status").populate("appointment").lean();

    return res.status(201).json({ success: true, data: leanPass });
  } catch (error) {
    return next(error);
  }
};

const listPasses = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === ROLES.SECURITY) {
      filter.location = req.user.location;
    }

    const items = await Pass.find(filter).populate("visitor appointment issuedBy").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

const myPass = async (req, res, next) => {
  try {
    const visitorProfile = await Visitor.findOne({ email: req.user.email }).lean();
    if (!visitorProfile) return res.json({ success: true, data: null });

    const latestPass = await Pass.find({ visitor: visitorProfile._id }).sort({ createdAt: -1 }).populate("visitor appointment").lean();

    return res.json({ success: true, data: latestPass });
  } catch (error) {
    return next(error);
  }
};

const getPass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id).populate("visitor appointment").lean();

    if (!pass) return res.status(404).json({ success: false, message: MESSAGES.passNotFound });

    if (req.user.role === ROLES.SECURITY && pass.location !== req.user.location) {
      return res.status(403).json({ success: false, message: MESSAGES.forbidden });
    }

    return res.json({ success: true, data: pass });
  } catch (error) {
    return next(error);
  }
};

const verifyPass = async (req, res, next) => {
  try {
    const pass = await Pass.findOne({
      passCode: req.params.passCode,
      isActive: true,
    })
      .populate({ path: "visitor", populate: { path: "host", select: "name email phone" } })
      .populate("appointment")
      .lean();

    if (!pass) return res.status(404).json({ success: false, message: MESSAGES.invalidPass });

    return res.json({ success: true, data: pass });
  } catch (error) {
    return next(error);
  }
};

const deactivatePass = async (req, res, next) => {
  try {
    const existing = await Pass.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ success: false, message: MESSAGES.passNotFound });

    if (req.user.role === ROLES.SECURITY && existing.location !== req.user.location) {
      return res.status(403).json({ success: false, message: MESSAGES.forbidden });
    }

    const pass = await Pass.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.PASS_DEACTIVATED,
      targetModel: "Pass",
      targetId: req.params.id,
    });

    return res.json({ success: true, data: pass });
  } catch (error) {
    return next(error);
  }
};

module.exports = { generatePass, listPasses, myPass, getPass, verifyPass, deactivatePass };
