import User from "../models/user-models.js";
import Post from "../models/post-models.js";
import Reel from "../models/reel-model.js";
import Story from "../models/story-model.js";
import Comment from "../models/comment-model.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── Stats ──
export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers, totalPosts, totalReels, totalStories, totalComments,
    todayUsers, todayPosts, todayReels,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Reel.countDocuments(),
    Story.countDocuments(),
    Comment.countDocuments(),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    Post.countDocuments({ createdAt: { $gte: todayStart } }),
    Reel.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  return res.status(200).json({
    stats: {
      totalUsers, totalPosts, totalReels, totalStories, totalComments,
      todayUsers, todayPosts, todayReels,
    },
  });
});

// ── Users ──
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });
  return res.status(200).json({ users });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next({ status: 404, message: "User not found" });
  if (user.isAdmin) return next({ status: 403, message: "Cannot delete an admin" });
  await User.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "User deleted" });
});
export const toggleBan = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next({ status: 404, message: "User not found" });

  // ✅ cannot ban super admin
  if (user.email === process.env.SUPER_ADMIN_EMAIL) {
    return next({ status: 403, message: "Super admin cannot be banned" });
  }

  // ✅ cannot ban yourself
  if (String(user._id) === String(req.user._id)) {
    return next({ status: 403, message: "You cannot ban yourself" });
  }

  // ✅ regular admin cannot ban other admins
  if (user.isAdmin && req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return next({ status: 403, message: "Only super admin can ban admins" });
  }

  user.isBanned = !user.isBanned;
  await user.save();
  return res.status(200).json({
    message: user.isBanned ? "User banned" : "User unbanned",
    isBanned: user.isBanned,
  });
});


export const toggleAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next({ status: 404, message: "User not found" });

  // ✅ super admin cannot be demoted by anyone
  if (user.email === process.env.SUPER_ADMIN_EMAIL) {
    return next({ status: 403, message: "Super admin cannot be demoted" });
  }

  // ✅ only super admin can promote/demote others
  if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return next({ status: 403, message: "Only super admin can manage admin roles" });
  }

  user.isAdmin = !user.isAdmin;
  await user.save();
  return res.status(200).json({
    message: user.isAdmin ? "Promoted to admin" : "Demoted from admin",
    isAdmin: user.isAdmin,
  });
});

// ── Posts ──
export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ posts });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next({ status: 404, message: "Post not found" });
  await Post.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Post deleted" });
});

// ── Reels ──
export const getAllReels = asyncHandler(async (req, res) => {
  const reels = await Reel.find()
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ reels });
});

export const deleteReel = asyncHandler(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return next({ status: 404, message: "Reel not found" });
  await Reel.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Reel deleted" });
});

// ── Stories ──
export const getAllStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ stories });
});

export const deleteStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);
  if (!story) return next({ status: 404, message: "Story not found" });
  await Story.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Story deleted" });
});

// ── Comments ──
export const getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ comments });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next({ status: 404, message: "Comment not found" });
  await Comment.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Comment deleted" });
});