const mongoose = require('mongoose')

const BankAccountSchema = mongoose.Schema(
  {
    accountNumber: String,
    bankId: { type: mongoose.Types.ObjectId, ref: 'Bank', required: true },
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('BankAccount', BankAccountSchema)
