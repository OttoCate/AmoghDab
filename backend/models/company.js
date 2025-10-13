const mongoose = require("mongoose");

const CompanySchema = mongoose.Schema(
  {
    name: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
