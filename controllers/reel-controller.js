
import Reel from "../models/reel-model.js"
import asyncHandler from "../utils/asyncHandler.js"
// creating reels
export const createReel = asyncHandler(async (req, res, next) => {
  const { caption } = req.body;
  const videoUrl = req.file?.path;
  if (!videoUrl) return next({ status: 400, message: "Video required" });

  const reel = await Reel.create({ user: req.user._id, videoUrl, caption });
  return res.status(201).json({ message: "Reel created", reel });
});
// all reels
export const getAllReels = asyncHandler(async (req, res, next) => {
  const reels = await Reel.find({ isPublic: true })
    .populate("user", "userName avatar")
    .sort({ createdAt: -1 });
  return res.status(200).json({ reels });
});
// delete reel
export const deleteReel = asyncHandler(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return next({ status: 404, message: "Reel not found" });
  if (reel.user.toString() !== req.user._id.toString())
    return next({ status: 403, message: "Not your reel" });
  await reel.deleteOne();
  return res.status(200).json({ message: "Reel deleted" });
});
 

// reel badhega
export const toggleReelLike = asyncHandler(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return next({ status: 404, message: "Reel not found" });

  const alreadyLiked = reel.likes.includes(req.user._id);

  await Reel.findByIdAndUpdate(
    req.params.id,
    alreadyLiked
      ? { $pull: { likes: req.user._id } }
      : { $addToSet: { likes: req.user._id } }
  );

  return res.status(200).json({ 
    message: alreadyLiked ? "Unliked" : "Liked" 
  });
});
//  increse the reel view
export const incrementReelView = asyncHandler(async (req, res, next) => {
  await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  return res.status(200).json({ message: "View counted" });
});
  

// saving the reels 
export const toggleReelSave = asyncHandler(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return next({ status: 404, message: "Reel not found" });

  const alreadySaved = reel.saved?.includes(req.user._id);

  // ✅ Use $pull/$addToSet instead of .save()
  await Reel.findByIdAndUpdate(
    req.params.id,
    alreadySaved
      ? { $pull: { saved: req.user._id } }
      : { $addToSet: { saved: req.user._id } }
  );

  return res.status(200).json({ 
    message: alreadySaved ? "Unsaved" : "Saved" 
  });
});