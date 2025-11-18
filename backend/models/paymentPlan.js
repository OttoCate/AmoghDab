const mongoose = require('mongoose')

const PaymentPlanSchema = mongoose.Schema(
  {
    subject: String,
    content: String,
    amount: Number,
    dueDate: Number,
  },
  { timestamps: true }
)

module.exports = mongoose.model('PaymentPlan', PaymentPlanSchema)
