const bcrypt = require('bcrypt')
const saltRounds = 10
const Users = require('../models/user')
const jwt = require('jsonwebtoken')

const userCtrl = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body
      // Check if providing all information
      if (!username.trim() || !password.trim())
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })
      const user = await Users.findOne({ username, active: true })

      if (!user)
        return res
          .status(400)
          .json({ msg: 'Tài khoản không tồn tại hoặc bị vô hiệu' })
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch)
        return res.status(400).json({ msg: 'Mật khẩu không hợp lệ' })

      const access_token = createAccessToken({ id: user._id })
      res.cookie(process.env.COOKIE_NAME, access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sign: true,
        sameSite: 'lax',
      })

      const myUser = await Users.findOne({ username })
        .select('username name companyIds role')
        .populate('companyIds', 'name')

      res.status(200).json({ data: myUser })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, password, name, role } = req.body
      if (!username.trim() || !password.trim())
        return res
          .status(400)
          .json({ msg: 'Vui lòng cung cấp đầy đủ thông tin' })
      if (req.user.role !== 'manager' || req.user.role !== 'admin')
        return res
          .status(401)
          .json({ msg: 'Bạn không đủ thẩm quyền để tạo người dùng' })
      const existingUser = await Users.findOne({ username })
      if (existingUser)
        return res.status(400).json({ msg: 'Tài khoản đã tồn tại' })

      const passwordHash = await bcrypt.hash(password, saltRounds)
      await Users.create({
        username,
        password: passwordHash,
        name,
        role,
      })

      res.status(200).json({ msg: 'Đã tạo hoàn tất người dùng' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await Users.find({ role: { $ne: 'admin' } })
        .select('username name active role companyIds')
        .populate('companyIds', 'name')
      res.status(200).json({ data: users })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  updateUser: async (req, res) => {
    try {
      let parameters = { ...req.body }
      const { id } = req.params
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === null) {
          delete parameters[key]
        }
      })
      if (parameters?.role && parameters?.role === 'admin')
        return res.status(400).json({ msg: 'Không được phép cấp quyền admin' })

      const user = await Users.findOne({ _id: id })
      if (user && user.role === 'admin' && parameters?.active !== undefined)
        return res
          .status(400)
          .json({ msg: 'Không được phép thay đổi trạng thái của admin' })
      await Users.findOneAndUpdate({ _id: id }, { ...parameters })
      res.status(200).json({ msg: 'Thành công' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  checkAuth: async (req, res) => {
    try {
      const cookies = req.cookies
      const authCookie = cookies[process.env.COOKIE_NAME]
      if (!authCookie)
        return res.status(200).json({ msg: 'Cần phải đăng nhập để tiếp tục' })
      const payload = isTokenValid(authCookie)

      if (!payload)
        return res
          .status(403)
          .json({ msg: 'Phiên làm việc không hợp lệ! Vui lòng đăng nhập lại' })
      const user = await Users.findById(payload.id)
        .select('username role name companyIds active')
        .populate('companyIds', 'name')

      if (!user.active)
        return res.status(400).json({ msg: 'Tài khoản đã bị vô hiệu hóa' })
      res.status(200).json({ data: user })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie(process.env.COOKIE_NAME)

      res.status(200).json({ msg: 'User logged out!' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPass, newPass } = req.body
      if (!oldPass.trim() || !newPass.trim())
        return res.status(401).json({ msg: 'Vui lòng nhập đầy đủ thông tin' })

      const user = await Users.findOne({ _id: req.user })

      if (!user) return res.status(401).json({ msg: 'Tài khoản không tồn tại' })

      const isMatch = await bcrypt.compare(oldPass, user.password)
      if (!isMatch)
        return res.status(400).json({ msg: 'Mật khẩu cũ không chính xác' })

      const passwordHash = await bcrypt.hash(newPass, saltRounds)
      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          password: passwordHash,
        }
      )

      res.status(200).json({ msg: 'Success' })
    } catch (error) {
      res.status(500).json({ msg: error.message })
    }
  },
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET)
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = userCtrl
