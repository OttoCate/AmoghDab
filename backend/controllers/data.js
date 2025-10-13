const Companies = require("../models/company");

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
};

module.exports = dataCtrl;
