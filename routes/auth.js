const express = require("express")
const router = express.Router()
const {
  sendOtp,
  verifyOtp,
  setPassword,
  setUsername,
  resendOtp,
  login,
  logout,
} = require("../controllers/authController")

router.post("/send-otp", sendOtp)
router.post("/verify-otp", verifyOtp)
router.post("/set-password", setPassword)
router.post("/set-username", setUsername)
router.post("/resend-otp", resendOtp)
router.post("/login", login)

module.exports = router