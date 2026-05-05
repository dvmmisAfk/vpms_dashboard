// utils/auditLog.js
const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({ req, actor, action, targetModel, targetId, details }) => {
  await AuditLog.create({
    actor,
    action,
    targetModel,
    targetId,
    details,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
  });
};

module.exports = createAuditLog;
