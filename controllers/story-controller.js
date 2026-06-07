import Story from "../models/story-model.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createStory = asyncHandler(async (req, res, next) => {
  const { text, emoji, mediaType } = req.body;
  const mediaUrl = req.file?.path;

  // ✅ Validate mediaType
  if (!mediaUrl) {
    return next({ status: 400, message: "Media required" });
  }

  if (!mediaType || !["image", "video"].includes(mediaType)) {
    return next({ status: 400, message: "Invalid mediaType - must be 'image' or 'video'" });
  }

  
  const story = await Story.create({
    user: req.user._id,
    mediaUrl,
    mediaType, // ✅ Now required and validated
    text: text || "",
    emoji: emoji || "",
  });

  return res.status(201).json({ message: "Story created", story });
});
export const getAllStories =asyncHandler(async(req,res,next)=>{
 const stories = await Story.find({ expiresAt: { $gt: new Date() } })
 .populate("user","userName avatar ")
     .sort({ createdAt: -1 });
     return res.status(200).json({stories})
})
export const viewStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);
  if (!story) return next({ status: 404, message: "Story not found" });
  const alreadyViewed = story.views.includes(req.user._id);
  if (!alreadyViewed) {
    story.views.push(req.user._id);
    await story.save();
  }
  return res.status(200).json({ message: "Viewed", views: story.views.length });
});

export const deleteStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);
  if (!story) return next({ status: 404, message: "Story not found" });
  if (story.user.toString() !== req.user._id.toString())
    return next({ status: 403, message: "Not your story" });
  await story.deleteOne();
  return res.status(200).json({ message: "Story deleted" });
});
