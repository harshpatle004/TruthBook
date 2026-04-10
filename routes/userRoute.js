const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer({ dest: "uploads/" })
const verifyToken = require("../middleware/verifyToken")
const {
  getProfile,
  updateProfile,
  updateProfilePic,
  updateCoverPic,
  changePassword
} = require("../controllers/profileController")

router.get("/profile",                verifyToken, getProfile)
router.put("/profile",                verifyToken, updateProfile)
router.put("/profile/picture",        verifyToken, upload.single("profilePic"), updateProfilePic)
router.put("/profile/cover",          verifyToken, upload.single("coverPic"),   updateCoverPic)
router.put("/profile/password",       verifyToken, changePassword)

module.exports = router