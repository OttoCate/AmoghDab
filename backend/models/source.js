const mongoose = require('mongoose')

const SourceSchema = mongoose.Schema(
  {
    name: String,
    type: String,
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    bankAccountId: {
      type: mongoose.Types.ObjectId,
      ref: 'BankAccount',
    },
    value: Number,
    currency: String,
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Source', SourceSchema)
