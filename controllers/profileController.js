const User = require("../models/Users");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcrypt");

// GET /user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -blockList")
      .populate({ path: "posts", options: { sort: { createdAt: -1 }, limit: 20 } });

    res.status(200).json({
      user: {
        ...user.toObject(),
        postsCount: user.posts.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT /user/profile  ← Edit profile (text fields)
const updateProfile = async (req, res) => {
  try {
    const { fullName, userName, bio, visibility } = req.body;
    const userId = req.user._id;
    const updates = {};

    if (fullName) {
      if (fullName.trim().length < 2)
        return res.status(400).json({ message: "Full name too short" });
      updates.fullName = fullName.trim();
    }

    if (userName) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(userName))
        return res.status(400).json({ message: "Invalid username format" });

      const taken = await User.findOne({ userName, _id: { $ne: userId } });
      if (taken)
        return res.status(400).json({ message: "Username already taken" });

      updates.userName = userName.toLowerCase();
    }

    if (bio !== undefined) {
      if (bio.length > 160)
        return res.status(400).json({ message: "Bio max 160 characters" });
      updates.bio = bio.trim();
    }

    if (visibility) {
      if (!["Public", "Private"].includes(visibility))
        return res.status(400).json({ message: "Invalid visibility value" });
      updates.visibility = visibility;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: "-password -blockList" }
    );

    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: "Username already taken" });
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT /user/profile/picture  ← Upload profile pic
const updateProfilePic = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image provided" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pics",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: result.secure_url },
      { new: true, select: "-password -blockList" }
    );

    res.status(200).json({ message: "Profile picture updated", profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT /user/profile/cover  ← Upload cover photo
const updateCoverPic = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image provided" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cover_pics",
      transformation: [{ width: 1200, height: 400, crop: "fill" }],
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverPicture: result.secure_url },
      { new: true, select: "-password -blockList" }
    );

    res.status(200).json({ message: "Cover photo updated", coverPicture: user.coverPicture });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT /user/profile/password  ← Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password min 6 characters" });

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match)
      return res.status(401).json({ message: "Current password is wrong" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getProfile, updateProfile, updateProfilePic, updateCoverPic, changePassword };
