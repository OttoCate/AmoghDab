const mongoose = require('mongoose')

const BankSchema = mongoose.Schema(
  {
    name: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Bank', BankSchema)
