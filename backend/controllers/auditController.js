// controllers/auditController.js
const AuditLog = require("../models/AuditLog");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const listAuditLogs = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const { actor, action, targetModel, start, end } = req.query;
    const filter = {};

    if (actor) filter.actor = actor;
    if (action) filter.action = action;
    if (targetModel) filter.targetModel = targetModel;

    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }

    const items = await AuditLog.find(filter).populate("actor", "name email role").sort({ timestamp: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listAuditLogs };
