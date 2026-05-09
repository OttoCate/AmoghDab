const mongoose = require('mongoose')

const PaymentPlanSchema = mongoose.Schema(
  {
    subject: String,
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    content: String,
    amount: Number,
    dueDate: Date,
    state: { type: String, default: 'ongoing' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PaymentPlan', PaymentPlanSchema)
