const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: { type: String },
    name: String,
    companyIds: [{ type: mongoose.Types.ObjectId, ref: 'Company' }],
    active: { type: Boolean, default: true },
    role: { type: String, default: 'basic' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
