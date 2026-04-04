const User = require("../models/Users")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("../service/EmailService")

// In-memory store (replace with Redis in production)
const otpStore = new Map()
const registrationStore = new Map()

// ─────────────────────────────────────────
// STEP 1 — Send OTP
// POST /auth/send-otp
// Body: { fullName, email }
// ─────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { fullName, email } = req.body

    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email are required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    otpStore.set(email, { otp, expiresAt })
    registrationStore.set(email, { fullName, email })

    await sendEmail(email, otp, fullName.split(" ")[0])

    res.status(200).json({ message: "OTP sent to " + email })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to send OTP" })
  }
}


// ─────────────────────────────────────────
// STEP 2 — Verify OTP
// POST /auth/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────
const verifyOtp = (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const record = otpStore.get(email)

    if (!record) {
      return res.status(400).json({ message: "OTP not found, please request a new one" })
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email)
      return res.status(400).json({ message: "OTP expired, please request a new one" })
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    otpStore.delete(email)

    const userData = registrationStore.get(email)
    registrationStore.set(email, { ...userData, emailVerified: true })

    res.status(200).json({ message: "Email verified successfully" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}


// ─────────────────────────────────────────
// STEP 3 — Set Password
// POST /auth/set-password
// Body: { email, password }
// ─────────────────────────────────────────
const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const userData = registrationStore.get(email)

    if (!userData || !userData.emailVerified) {
      return res.status(400).json({ message: "Please verify your email first" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    registrationStore.set(email, { ...userData, password: hashedPassword })

    res.status(200).json({ message: "Password set successfully" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}


// ─────────────────────────────────────────
// STEP 4 — Set Username & Create User
// POST /auth/set-username
// Body: { email, userName }
// ─────────────────────────────────────────
const setUsername = async (req, res) => {
  try {
    const { email, userName } = req.body

    if (!email || !userName)
      return res.status(400).json({ message: "Email and username are required" })

    // 1. Validate format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(userName))
      return res.status(400).json({ message: "Invalid username format" })

    const userData = registrationStore.get(email)
    if (!userData || !userData.emailVerified || !userData.password)
      return res.status(400).json({ message: "Please complete previous steps first" })

    const existingUserName = await User.findOne({ userName })
    if (existingUserName)
      return res.status(400).json({ message: "Username already taken" })

    const newUser = new User({
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      userName,
    })

    const savedUser = await newUser.save()
    registrationStore.delete(email)

    // 2. Use .toObject() instead of ._doc
    const { password: _, ...finalUserData } = savedUser.toObject()

    const token = jwt.sign(
      { _id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    )

    return res.status(201).json({ message: "Account created successfully", user: finalUserData, token })

  } catch (error) {
    // 3. Handle race condition duplicate key error
    if (error.code === 11000)
      return res.status(400).json({ message: "Username already taken" })

    console.error(`[setUsername] Error:`, error.message)
    return res.status(500).json({ message: "Something went wrong" })
  }
}


// ─────────────────────────────────────────
// Resend OTP
// POST /auth/resend-otp
// Body: { email }
// ─────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const userData = registrationStore.get(email)
    if (!userData) {
      return res.status(400).json({ message: "Please start registration again" })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000

    otpStore.set(email, { otp, expiresAt })

    await sendEmail(email, otp, userData.fullName.split(" ")[0])

    res.status(200).json({ message: "OTP resent to " + email })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to resend OTP" })
  }
}


// ─────────────────────────────────────────
// Login
// POST /auth/login
// Body: { email or userName, password }
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, userName, password } = req.body

    if (!password || (!email && !userName)) {
      return res.status(400).json({ message: "Email/Username and password required" })
    }

    const user = email
      ? await User.findOne({ email })
      : await User.findOne({ userName })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: "Wrong credentials" })
    }

    const { password: _, ...userData } = user._doc

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.status(200).json({ user: userData, token })

  } catch (error) {
    console.error("ERROR:", error)
    res.status(500).json({ message: error.message })
  }
}


// ─────────────────────────────────────────
// Logout
// GET /auth/logout
// ─────────────────────────────────────────
const logout = async (req, res) => {
  try {
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("ERROR:", error)
    res.status(500).json({ message: error.message })
  }
}


module.exports = { sendOtp, verifyOtp, setPassword, setUsername, resendOtp, login, logout }