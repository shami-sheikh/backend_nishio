import User from "../models/user-models.js";
import asyncHandler from "../utils/asyncHandler.js"
import createNotification from "../utils/createNotification.js";



// get all users (for explore/search)
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user._id } }) // exclude yourself
    .select("userName avatar bio followers")
    .sort({ createdAt: -1 });

  return res.status(200).json({ users });
});
// to get your user 
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next({
      status: 404,
      message: "user not found",
      extraDetails: "invalid user",
    });
  }
  return res.status(200).json({ user });
});


export const updateProfile = asyncHandler(async (req, res, next) => {
  const { userName, bio } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { 
      ...(userName && { userName }), 
      ...(bio && { bio }) 
    },
    { new: true, runValidators: true }
  ).select("-password");

  return res.status(200).json({ user: updated });
});
// uploading your profile picture
export const updateAvatar = asyncHandler(async (req, res, next) => {
  const mediaUrl = req.file?.path;
  if (!mediaUrl) {
    return next({ status: 400, message: "Image required" });
  }

  const updated = await User.findByIdAndUpdate(
  req.user._id,
  { avatar: mediaUrl },
  { returnDocument: "after" }  // ← use this instead
).select("-password");
  return res.status(200).json({ user: updated });
});
// get authenticated user's avatar
export const getAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("avatar");
  if (!user) return next({ status: 404, message: "user not found" });
  
  return res.status(200).json({ 
    avatar: user.avatar,
    message: "Avatar fetched"
  });
});
export const toggleFollow = asyncHandler(async (req, res, next) => {
  const targetId = req.params.id;
  const currentUser = req.user;

  if (targetId === currentUser._id.toString()) {
    return next({ status: 400, message: "You can't follow yourself" });
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) return next({ status: 404, message: "User not found" });

  const alreadyFollowing = currentUser.following.includes(targetId);
if (!alreadyFollowing) {
  await createNotification({
    recipient: targetId,
    sender: currentUser._id,
    type: "follow",
    message: `${currentUser.userName} started following you`,
  });
}
  if (alreadyFollowing) {
    await User.findByIdAndUpdate(currentUser._id, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUser._id } });
    return res.status(200).json({ message: "Unfollowed" });
  } else {
    await User.findByIdAndUpdate(currentUser._id, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUser._id } });
    return res.status(200).json({ message: "Followed" });
  }
});