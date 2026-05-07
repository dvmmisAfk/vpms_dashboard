const mongoose = require('mongoose')

const passSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    // this is the uuid we generate when issuing the pass
    passCode: { type: String, required: true, unique: true, index: true },
    // base64 string of the qr image
    qrCodeData: { type: String, required: true },
    pdfUrl: { type: String, trim: true },
    validFrom: { type: Date, required: true },
    // default is 1 day from creation but we set it manually from the frontend
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, trim: true, default: 'hq' },
  },
  { timestamps: true }
)

// console.log('pass model loaded')

module.exports = mongoose.model('Pass', passSchema)
