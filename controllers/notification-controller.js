import Notification from "../models/notification-model.js";
import asyncHandler from "../utils/asyncHandler.js";

// get all notifications for logged in user
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "userName avatar")
    .sort({ createdAt: -1 })
    .limit(50);

  return res.status(200).json({ notifications });
});

// get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });
  return res.status(200).json({ count });
});

// mark all as read
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  return res.status(200).json({ message: "All marked as read" });
});

// mark one as read
export const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  return res.status(200).json({ message: "Marked as read" });
});

// delete one
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Deleted" });
});

// delete all
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  return res.status(200).json({ message: "All deleted" });
});