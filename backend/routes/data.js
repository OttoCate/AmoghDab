const express = require('express')
const router = express.Router()
const dataCtrl = require('../controllers/data.js')
const { rateLimit } = require('express-rate-limit')
const { authenticate } = require('../middlewares/middleware.js')

const limiter = rateLimit({
  windowMs: 60 * 1000 * 2, // 2 minutes
  limit: 60, // Limit each IP to 60 requests per `window` (here, per 2 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: function (req, res) {
    res.status(429).send({
      status: 500,
      message: 'Quá nhiều yêu cầu được gửi! Vui lòng thử lại sau ít phút',
    })
  },
})

router.post('/create-company', limiter, authenticate, dataCtrl.createCompany)
router.post('/create-bank', limiter, authenticate, dataCtrl.createBank)
router.post(
  '/create-bank-account',
  limiter,
  authenticate,
  dataCtrl.createBankAccount
)
router.post(
  '/create-indenture',
  limiter,
  authenticate,
  dataCtrl.createIndenture
)
router.post(
  '/create-payment-plan',
  limiter,
  authenticate,
  dataCtrl.createPaymentPlan
)

router.patch('/update-bank/:id', limiter, authenticate, dataCtrl.updateBank)
router.patch(
  '/update-bank-account/:id',
  limiter,
  authenticate,
  dataCtrl.updateBankAccount
)
router.patch(
  '/update-indenture/:id',
  limiter,
  authenticate,
  dataCtrl.updateIndenture
)
router.patch(
  '/update-payment-plan/:id',
  limiter,
  authenticate,
  dataCtrl.updatePaymentPlan
)

router.get('/get-companies', limiter, authenticate, dataCtrl.getCompanies)
router.get('/get-banks', limiter, authenticate, dataCtrl.getBanks)
router.get(
  '/get-bank-accounts',
  limiter,
  authenticate,
  dataCtrl.getBankAccounts
)
router.get('/get-indentures', limiter, authenticate, dataCtrl.getIndentures)
router.get(
  '/get-payment-plans',
  limiter,
  authenticate,
  dataCtrl.getPaymentPlans
)

module.exports = router
