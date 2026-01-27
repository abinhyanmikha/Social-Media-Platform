const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Follower = require("../models/Follower");

const router = express.Router();
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followersRaw = await Follower.find({ following: user._id }).populate(
      "follower",
      "username"
    );
    const followingRaw = await Follower.find({ follower: user._id }).populate(
      "following",
      "username"
    );

    res.json({
      ...user.toObject(),
      followers: followersRaw.map((f) => f.follower),
      following: followingRaw.map((f) => f.following),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
//follow unfollow

router.put("/:id/follow", auth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFollow = await Follower.findOne({
      follower: req.user._id,
      following: req.params.id,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      return res.json({ message: "Unfollowed successfully" });
    }

    await Follower.create({
      follower: req.user._id,
      following: req.params.id,
    });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
