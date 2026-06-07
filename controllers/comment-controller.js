import Comment from "../models/comment-model.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";
import Post from "../models/post-models.js";
import Reel from "../models/reel-model.js";
import Story from "../models/story-model.js";
// Get comments for post/reel/story
export const getComments = asyncHandler(async (req, res, next) => {
  const { targetType, targetId } = req.params;

  
  if (!["Post", "Reel", "Story"].includes(targetType)) {
    return next({ status: 400, message: "Invalid target type" });
  }

  const comments = await Comment.find({ targetType, targetId })
    .populate("user", "userName avatar")
    .populate("replies.user", "userName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json({ comments });
});

// Create comment
export const createComment = asyncHandler(async (req, res, next) => {
  const { targetType, targetId } = req.params;
  const { text } = req.body;

  if (!["Post", "Reel", "Story"].includes(targetType)) {
    return next({ status: 400, message: "Invalid target type" });
  }

  if (!text || text.trim().length === 0) {
    return next({ status: 400, message: "Comment text required" });
  }

  const comment = await Comment.create({
    targetType,
    targetId,
    user: req.user._id,
    text: text.trim(),
  });

  // ✅ fetch the actual owner of the post/reel/story
  let targetOwner = null;
  try {
    if (targetType === "Post") {
      const post = await Post.findById(targetId).select("user");
      targetOwner = post?.user;
    } else if (targetType === "Reel") {
      const reel = await Reel.findById(targetId).select("user");
      targetOwner = reel?.user;
    } else if (targetType === "Story") {
      const story = await Story.findById(targetId).select("user");
      targetOwner = story?.user;
    }
  } catch {}

  // ✅ only notify if we found the owner
  if (targetOwner) {
    await createNotification({
      recipient: targetOwner,
      sender: req.user._id,
      type: "comment",
      message: `${req.user.userName} commented: ${text.slice(0, 50)}`,
    });
  }

  const populatedComment = await comment.populate("user", "userName avatar");
  return res.status(201).json({ message: "Comment created", comment: populatedComment });
});

// Delete comment
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  if (String(comment.user) !== String(req.user._id)) {
    return next({ status: 403, message: "Can only delete your own comments" });
  }

  await Comment.findByIdAndDelete(commentId);
  return res.status(200).json({ message: "Comment deleted" });
});

// Edit comment
export const editComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return next({ status: 400, message: "Comment text required" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  if (String(comment.user) !== String(req.user._id)) {
    return next({ status: 403, message: "Can only edit your own comments" });
  }

  comment.text = text.trim();
  comment.updatedAt = new Date();
  await comment.save();

  //  Re-fetch with full population instead of chaining .populate() on instance
  const populatedComment = await Comment.findById(commentId)
    .populate("user", "userName avatar")
    .populate("replies.user", "userName avatar");

  return res.status(200).json({ message: "Comment updated", comment: populatedComment });
}); 
// Like comment
export const likeComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  const alreadyLiked = comment.likes.includes(req.user._id);

  if (alreadyLiked) {
    comment.likes.pull(req.user._id);
  } else {
    comment.likes.push(req.user._id);
  }

  await comment.save();
  return res.status(200).json({ 
    message: alreadyLiked ? "Unliked" : "Liked",
    likes: comment.likes.length 
  });
});

// Add reply to comment

export const addReply = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return next({ status: 400, message: "Reply text required" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  comment.replies.push({
    user: req.user._id,
    text: text.trim(),
  });
await createNotification({
  recipient: comment.user,
  sender: req.user._id,
  type: "reply",
  message: `${req.user.userName} replied to your comment`,
});
  await comment.save();

  // ✅ Populate BOTH user and replies.user
  const populatedComment = await Comment.findById(commentId)
    .populate("user", "userName avatar")
    .populate("replies.user", "userName avatar");

  return res.status(201).json({ message: "Reply added", comment: populatedComment });
});

// Delete reply
export const deleteReply = asyncHandler(async (req, res, next) => {
  const { commentId, replyId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    return next({ status: 404, message: "Reply not found" });
  }

  if (String(reply.user) !== String(req.user._id)) {
    return next({ status: 403, message: "Can only delete your own replies" });
  }

  reply.deleteOne();
  await comment.save();

  return res.status(200).json({ message: "Reply deleted" });
});

// Like reply
export const likeReply = asyncHandler(async (req, res, next) => {
  const { commentId, replyId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next({ status: 404, message: "Comment not found" });
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    return next({ status: 404, message: "Reply not found" });
  }

  const alreadyLiked = reply.likes.includes(req.user._id);

  if (alreadyLiked) {
    reply.likes.pull(req.user._id);
  } else {
    reply.likes.push(req.user._id);
  }

  await comment.save();
  return res.status(200).json({ 
    message: alreadyLiked ? "Unliked" : "Liked",
    likes: reply.likes.length 
  });
});