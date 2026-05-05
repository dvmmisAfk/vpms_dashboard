// models/Appointment.js
const mongoose = require("mongoose");
const { APPOINTMENT_STATUSES } = require("../utils/constants");

const appointmentSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    purpose: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUSES),
      default: APPOINTMENT_STATUSES.PENDING,
    },
    notes: { type: String, trim: true },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
