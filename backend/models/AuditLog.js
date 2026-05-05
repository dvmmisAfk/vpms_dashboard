// models/AuditLog.js
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, trim: true },
  targetModel: { type: String, trim: true },
  targetId: { type: String, trim: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
