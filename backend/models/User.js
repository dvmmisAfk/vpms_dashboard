const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// user schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false so password doesnt come back in normal queries
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'security', 'employee', 'visitor'],
      default: 'visitor'
    },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true, default: 'hq' },
    isActive: { type: Boolean, default: true },
    nickname: { type: String }, // was gonna use this for display names
  },
  { timestamps: true }
)

// before saving, hash the password if it changed
// found this pattern in the mongoose docs - the 'this' refers to the document being saved
userSchema.pre('save', async function() {
  // dont re-hash if the password field wasnt touched
  if (this.isModified('password') === false) {
    return
  }

  // bcrypt.hash(value, saltRounds) - 10 rounds is what most tutorials recommend
  this.password = await bcrypt.hash(this.password, 10)
})

// method to check if a password matches the stored hash
// called during login to compare what the user typed vs what we stored
userSchema.methods.comparePassword = async function(enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', userSchema)
