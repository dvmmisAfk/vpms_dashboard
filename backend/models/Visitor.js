// models/Visitor.js
const mongoose = require("mongoose");
const { VISITOR_STATUSES } = require("../utils/constants");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    purpose: { type: String, trim: true },
    location: { type: String, trim: true, default: "hq" },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(VISITOR_STATUSES),
      default: VISITOR_STATUSES.PENDING,
    },
    preRegistered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

module.exports = mongoose.model("Visitor", visitorSchema);
