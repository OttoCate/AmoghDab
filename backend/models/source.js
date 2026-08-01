const mongoose = require('mongoose')

const SourceSchema = mongoose.Schema(
  {
    type: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    vnd: Number,
    usd: Number,
    thb: Number,
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Source', SourceSchema)
