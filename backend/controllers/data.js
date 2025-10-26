const Companies = require("../models/company");
const Banks = require("../models/bank")
const BankAccounts = require("../models/bankAccount")

const dataCtrl = {
  createCompany: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name.trim())
        return res
          .status(400)
          .json({ msg: "Vui lòng cung cấp đầy đủ thông tin" });
      const existingCompany = await Companies.findOne({ name });
      if (existingCompany)
        return res.status(400).json({ msg: "Công ty đã tồn tại" });

      await Companies.create({
        name,
      });

      res.status(200).json({ msg: "Đã tạo hoàn tất công ty" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getCompanies: async (req, res) => {
    try {
      const companies = await Companies.find({}).select("name active");
      res.status(200).json({ data: companies });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createBank: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name.trim())
        return res
          .status(400)
          .json({ msg: "Vui lòng cung cấp đầy đủ thông tin" });
      const existingRecord = await Banks.findOne({ name });
      if (existingRecord)
        return res.status(400).json({ msg: "Ngân hàng đã tồn tại" });

      await Banks.create({
        name,
      });

      res.status(200).json({ msg: "Đã tạo hoàn tất ngân hàng" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getBanks: async (req, res) => {
    try {
      const banks = await Banks.find({}).select("name active");
      res.status(200).json({ data: banks });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createBankAccount: async (req, res) => {
    try {
      const { accountNumber,bankId, companyId} = req.body;
      if (!accountNumber.trim() || !bankId.trim() || !companyId.trim())
        return res
          .status(400)
          .json({ msg: "Vui lòng cung cấp đầy đủ thông tin" });
      const existingRecord = await Banks.findOne({ accountNumber });
      if (existingRecord)
        return res.status(400).json({ msg: "Số tài khoản đã tồn tại" });

      await Banks.create({ accountNumber,bankId, companyId});

      res.status(200).json({ msg: "Đã tạo hoàn tất số tài khoản" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getBankAccounts: async (req, res) => {
    try {
      const banks = await BankAccounts.find({}).select("accountNumber,bankId, companyId active");
      res.status(200).json({ data: banks });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = dataCtrl;
