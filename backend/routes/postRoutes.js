const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
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
      .sort({ createdAt: -1 });

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ post: post._id })
          .populate("user", "username")
          .sort({ createdAt: 1 });
        return { ...post.toObject(), comments };
      })
    );

    res.json(postsWithComments);
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
    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text: req.body.text,
    });

    const populatedComment = await comment.populate("user", "username");
    res.json(populatedComment);
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
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    await comment.deleteOne();
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
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }
    comment.text = req.body.text || comment.text;
    await comment.save();
    res.json({ message: "comment updated", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET POSTS BY USER (Profile page)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ post: post._id })
          .populate("user", "username")
          .sort({ createdAt: 1 });
        return { ...post.toObject(), comments };
      })
    );

    res.json(postsWithComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
