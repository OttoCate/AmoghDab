const Companies = require('../models/company')
const Banks = require('../models/bank')
const BankAccounts = require('../models/bankAccount')
const Indentures = require('../models/indenture')
const PaymentPlans = require('../models/paymentPlan')
const Sources = require('../models/source')

const dataCtrl = {
  createCompany: async (req, res) => {
    try {
      const { name } = req.body
      if (!name.trim())
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })
      const existingCompany = await Companies.findOne({ name })
      if (existingCompany)
        return res.status(400).json({ msg: 'Công ty đã tồn tại' })

      await Companies.create({
        name,
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất công ty' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getCompanies: async (req, res) => {
    try {
      const companies = await Companies.find({}).select('name active')
      res.status(200).json({ data: companies })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createBank: async (req, res) => {
    try {
      const { name } = req.body
      if (!name.trim())
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })
      const existingRecord = await Banks.findOne({ name })
      if (existingRecord)
        return res.status(400).json({ msg: 'Ngân hàng đã tồn tại' })

      await Banks.create({
        name,
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất ngân hàng' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createIndenture: async (req, res) => {
    try {
      const {
        number,
        bankId,
        amount,
        date,
        dueDate,
        interestRate,
        interestAmount,
        residual,
        state,
        companyId,
      } = req.body
      if (
        !number.trim() ||
        !amount ||
        !date ||
        !dueDate ||
        !interestRate ||
        !residual ||
        !state.trim() ||
        !companyId.trim()
      )
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })

      await Indentures.create({
        number,
        bankId,
        amount,
        date,
        dueDate,
        interestRate,
        interestAmount,
        residual,
        state,
        companyId,
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất ngân hàng' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updateIndenture: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      const newOne = await Indentures.findOneAndUpdate(
        { _id: id },
        { ...parameters },
        { new: true }
      )
      if (!newOne)
        return res
          .status(400)
          .json({ msg: 'Khế ước này không có trong cơ sở dữ liệu' })
      res.status(200).json({ msg: 'Đã cập nhật thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getIndentures: async (req, res) => {
    try {
      const banks = await Indentures.find({})
        .select(
          'number bankId amount date dueDate interestRate interestAmount residual state companyId'
        )
        .populate('bankId companyId', 'name')
      res.status(200).json({ data: banks })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updateBank: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      const newOne = await Banks.findOneAndUpdate(
        { _id: id },
        { ...parameters },
        { new: true }
      )
      if (!newOne)
        return res
          .status(400)
          .json({ msg: 'Ngân hàng không có trong cơ sở dữ liệu' })
      res.status(200).json({ msg: 'Đã cập nhật thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getBanks: async (req, res) => {
    try {
      const banks = await Banks.find({}).select('name active')
      res.status(200).json({ data: banks })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createBankAccount: async (req, res) => {
    try {
      const { accountNumber, bankId, companyId, currency } = req.body
      if (
        !accountNumber.trim() ||
        !bankId.trim() ||
        !companyId.trim() ||
        !currency.trim()
      )
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })
      const existingRecord = await BankAccounts.findOne({ accountNumber })
      if (existingRecord)
        return res.status(400).json({ msg: 'Số tài khoản đã tồn tại' })

      await BankAccounts.create({ accountNumber, bankId, companyId, currency })

      res.status(200).json({ msg: 'Đã tạo hoàn tất số tài khoản' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getBankAccounts: async (req, res) => {
    try {
      const banks = await BankAccounts.find({
        companyId: { $in: req.user.companyIds },
      })
        .select('accountNumber bankId companyId active currency')
        .populate('bankId companyId')
      res.status(200).json({ data: banks })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updateBankAccount: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      const newOne = await BankAccounts.findOneAndUpdate(
        { _id: id, companyId: { $in: req.user.companyIds } },
        { ...parameters },
        { new: true }
      )
      if (!newOne)
        return res
          .status(400)
          .json({ msg: 'Số tài khoản không có trong cơ sở dữ liệu' })
      res.status(200).json({ msg: 'Đã cập nhật thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createPaymentPlan: async (req, res) => {
    try {
      const { subject, content, amount, dueDate, companyId } = req.body
      if (
        !subject.trim() ||
        !amount ||
        !dueDate ||
        !content.trim() ||
        !companyId.trim()
      )
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })

      await PaymentPlans.create({
        subject,
        content,
        amount,
        dueDate,
        companyId,
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất kế hoạch thanh toán' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updatePaymentPlan: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      const newOne = await PaymentPlans.findOneAndUpdate(
        { _id: id, companyId: { $in: req.user.companyIds } },
        { ...parameters },
        { new: true }
      )
      if (!newOne)
        return res
          .status(400)
          .json({ msg: 'Kế hoạc thanh toán này không có trong cơ sở dữ liệu' })
      res.status(200).json({ msg: 'Đã cập nhật thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getPaymentPlans: async (req, res) => {
    try {
      const banks = await PaymentPlans.find({
        companyId: { $in: req.user.companyIds },
      })
        .select('subject content amount dueDate state companyId')
        .populate('companyId', 'name')
      res.status(200).json({ data: banks })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createSource: async (req, res) => {
    try {
      const { companyId, departmentCode, thb, usd, vnd, type } = req.body
      if ((!type, !companyId))
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })

      await Sources.create({
        type,
        vnd,
        usd,
        thb,
        companyId,
        departmentCode,
        updatedBy: req.user._id,
        updatedAt: Date.now(),
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất nguồn' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updateSource: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      const newOne = await Sources.findOneAndUpdate(
        { _id: id, companyId: { $in: req.user.companyIds } },
        { ...parameters, updatedBy: req.user._id, updatedAt: Date.now() },
        { new: true }
      )
      if (!newOne)
        return res
          .status(400)
          .json({ msg: 'Nguồn này không có trong cơ sở dữ liệu' })
      res.status(200).json({ msg: 'Đã cập nhật thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getSources: async (req, res) => {
    try {
      const list = await Sources.find({
        companyId: { $in: req.user.companyIds },
      })
        .select('companyId departmentCode thb usd vnd type updatedBy updatedAt')
        .populate('companyId updatedBy', 'name')
      res.status(200).json({ data: list })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },
}

module.exports = dataCtrl
