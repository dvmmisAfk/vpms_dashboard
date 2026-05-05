// models/CheckLog.js
const mongoose = require("mongoose");
const { CHECK_ACTIONS } = require("../utils/constants");

const checkLogSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
  pass: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
  action: { type: String, enum: Object.values(CHECK_ACTIONS), required: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, trim: true, default: "hq" },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
});

module.exports = mongoose.model("CheckLog", checkLogSchema);
