// controllers/visitorController.js
const Visitor = require("../models/Visitor");
const User = require("../models/User");
const createAuditLog = require("../utils/auditLog");
const uploadPhotoBuffer = require("../utils/uploadPhotoBuffer");
const { sendIfValidationErrors } = require("../utils/validateRequest");
const { VISITOR_STATUSES, ROLES, AUDIT_ACTIONS } = require("../utils/constants");
const { MESSAGES } = require("../utils/messages");

const createVisitor = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const payload = { ...req.body };

    const hostDoc = await User.findById(payload.host).lean();
    payload.location = payload.location || hostDoc?.location || "hq";

    if (req.file) payload.photoUrl = await uploadPhotoBuffer(req.file.buffer);
    const visitor = await Visitor.create(payload);
    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.VISITOR_CREATED,
      targetModel: "Visitor",
      targetId: visitor._id.toString(),
    });

    const leanVisitor = await Visitor.findById(visitor._id).populate("host", "name email location").lean();
    return res.status(201).json({ success: true, data: leanVisitor });
  } catch (error) {
    return next(error);
  }
};

const listVisitors = async (req, res, next) => {
  try {
    const { q = "", status, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (req.user.role === ROLES.SECURITY) {
      filter.location = req.user.location;
    }

    if (q) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }, { company: { $regex: q, $options: "i" } }];
    }
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Visitor.find(filter).populate("host", "name email location").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean(),
      Visitor.countDocuments(filter),
    ]);

    return res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    return next(error);
  }
};

const getVisitor = async (req, res, next) => {
  try {
    const item = await Visitor.findById(req.params.id).populate("host", "name email location").lean();
    if (!item) return res.status(404).json({ success: false, message: MESSAGES.visitorNotFound });

    if (req.user.role === ROLES.SECURITY && item.location !== req.user.location) {
      return res.status(403).json({ success: false, message: MESSAGES.forbidden });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

const updateVisitor = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const updated = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("host", "name email location").lean();
    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const removeVisitor = async (req, res, next) => {
  try {
    const updated = await Visitor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.VISITOR_SOFT_DELETED,
      targetModel: "Visitor",
      targetId: req.params.id,
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const approveVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: VISITOR_STATUSES.APPROVED }, { new: true }).populate("host", "name email").lean();
    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.VISITOR_APPROVED,
      targetModel: "Visitor",
      targetId: req.params.id,
    });
    return res.json({ success: true, data: visitor });
  } catch (error) {
    return next(error);
  }
};

const rejectVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: VISITOR_STATUSES.REJECTED }, { new: true }).populate("host", "name email").lean();
    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.VISITOR_REJECTED,
      targetModel: "Visitor",
      targetId: req.params.id,
    });
    return res.json({ success: true, data: visitor });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createVisitor, listVisitors, getVisitor, updateVisitor, removeVisitor, approveVisitor, rejectVisitor };
