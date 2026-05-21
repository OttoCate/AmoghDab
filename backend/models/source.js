const mongoose = require('mongoose')

const SourceSchema = mongoose.Schema(
  {
    type: String,
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    vnd: Number,
    usd: Number,
    thb: Number,
    departmentCode: String,
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedAt: Date,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Source', SourceSchema)
