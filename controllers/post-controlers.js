import Post from "../models/post-models.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";
// creating my post
export const createPost = asyncHandler(async (req, res, next) => {
  const { caption, type } = req.body;
  const mediaUrl = req.file?.path;
  if (!mediaUrl) 
    return next({
      status: 400,
      message: "Media required",
      extraDetails: "Upload a photo or reel",
    });
  const post = await Post.create({
    user: req.user._id,
    type,
    caption,
    mediaUrl,
  });
  res.status(201).json({ message: "Post created", post });
});
// getting all the post 
export const getAllpost = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ isPublic: true })
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ posts });
});
// get single post
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "userName avatar",
  );
  if (!post)
    return next({
      status: 404,
      message: "Post not found",
      extraDetails: "Invalid post ID",
    });
  return res.status(200).json({ post });
});
// delete the damm post 
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post)
    return next({
      status: 404,
      message: "Post not found",
      extraDetails: "Invalid post ID",
    });
  if (post.user.toString() !== req.user._id.toString()) {
    return next({
      status: 403,
      message: "Forbidden",
      extraDetails: "Not your post",
    });
  }
  await post.deleteOne();
  return res.status(200).json({ message: "Post deleted" });
});
// like/dislike fuck
export const toggleLike = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next({ status: 404, message: "Post not found" });

  const alreadyLiked = post.likes.includes(req.user._id);
  if (!alreadyLiked) {
  await createNotification({
    recipient: post.user,
    sender: req.user._id,
    type: "like",
    post: post._id,
    message: `${req.user.userName} liked your post`,
  });
}
  await Post.findByIdAndUpdate(
    req.params.id,
    alreadyLiked
      ? { $pull: { likes: req.user._id } }
      : { $addToSet: { likes: req.user._id } }
  );
  return res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked" });
});

// save unsave fuck
export const toggleSave = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next({ status: 404, message: "Post not found" });

  const alreadySaved = post.saved?.includes(req.user._id);
  await Post.findByIdAndUpdate(
    req.params.id,
    alreadySaved
      ? { $pull: { saved: req.user._id } }
      : { $addToSet: { saved: req.user._id } }
  );
  return res.status(200).json({ message: alreadySaved ? "Unsaved" : "Saved" });
});