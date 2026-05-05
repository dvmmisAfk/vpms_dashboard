// models/Pass.js
const mongoose = require("mongoose");

const passSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    passCode: { type: String, required: true, unique: true, index: true },
    qrCodeData: { type: String, required: true },
    pdfUrl: { type: String, trim: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, trim: true, default: "hq" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

module.exports = mongoose.model("Pass", passSchema);
