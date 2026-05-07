const mongoose = require('mongoose')

// visitor schema - each row is one visitor record for a visit
const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: 'Visitor name is required, please provide it', trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    // cloudinary url, stored as string
    photoUrl: { type: String, trim: true },
    purpose: { type: String, trim: true },
    location: { type: String, trim: true, default: 'hq' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      // not using all of these yet but keeping them for later
      enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'],
      default: 'pending',
    },
    preRegistered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // badgeColor: String // was gonna make badges different colors per department
  },
  { timestamps: true }
)

module.exports = mongoose.model('Visitor', visitorSchema)
