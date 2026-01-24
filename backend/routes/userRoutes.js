const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userId);
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
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // If already following -> unfollow
    if (currentUser.following.includes(userToFollow._id)) {
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
      await currentUser.save();
      await userToFollow.save();

      return res.json({ message: "Unfollowed successfully" });
    }

    // Otherwise -> follow
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
