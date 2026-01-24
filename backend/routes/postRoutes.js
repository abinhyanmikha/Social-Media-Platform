const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * CREATE POST
 */
router.post("/", auth, async (req, res) => {
  try {
    const post = await Post.create({
      user: req.user._id,
      content: req.body.content,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET ALL POSTS (Feed)
 */
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * LIKE / UNLIKE POST
 */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADD COMMENT
 */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//delete post by owner
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    await post.deleteOne();
    res.json({ message: "post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//delete comment by owner
router.delete("/:postId/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId,
    );
    await post.save();
    res.json({ message: "comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//edit post by owner
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    post.content = req.body.content || post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//edit comment by ownere
router.put("/:postId/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "post  not found" });
    }
    const comment = post.comments.find(
      (c) => c._id.toString() === req.params.commentId,
    );
    if (!comment) {
      return res.status(404).json({ message: "comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    comment.text = req.body.text || comment.text;
    await post.save();
    res.json({ message: "comment updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET POSTS BY USER (Profile page)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
