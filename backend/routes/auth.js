const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/auth.js");
const { rateLimit } = require("express-rate-limit");
const { authenticate } = require("../middlewares/middleware.js");

const limiter = rateLimit({
  windowMs: 60 * 1000 * 2, // 2 minutes
  limit: 60, // Limit each IP to 60 requests per `window` (here, per 2 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: function (req, res) {
    res.status(429).send({
      status: 500,
      message: "Quá nhiều yêu cầu được gửi! Vui lòng thử lại sau ít phút",
    });
  },
});

router.get("/check-auth", limiter, authenticate, userCtrl.checkAuth);
router.post("/create-user", limiter, userCtrl.createUser);
router.post("/login", limiter, userCtrl.login);
router.delete("/log-out", userCtrl.logout);
router.patch(
  "/change-password",
  limiter,
  authenticate,
  userCtrl.changePassword
);

module.exports = router;
