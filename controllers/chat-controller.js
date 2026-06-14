import Conversation from "../models/conversation-model.js";
import Message from "../models/message-model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (String(userId) === String(currentUserId)) {
    return next({ status: 400, message: "Cannot message yourself" });
  }

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [currentUserId, userId], $size: 2 },
  }).populate("participants", "userName avatar");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUserId, userId],
      isGroup: false,
    });
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "userName avatar");
  }

  return res.status(200).json({ conversation });
});

export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "userName avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return res.status(200).json({ conversations });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next({ status: 404, message: "Conversation not found" });

  if (!conversation.participants.some(p => String(p) === String(req.user._id))) {
    return next({ status: 403, message: "Not a participant" });
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "userName avatar")
    .sort({ createdAt: 1 });

  return res.status(200).json({ messages });
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const { text } = req.body;
  const mediaUrl = req.file?.path || null;

  if (!text && !mediaUrl) {
    return next({ status: 400, message: "Message cannot be empty" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next({ status: 404, message: "Conversation not found" });

  if (!conversation.participants.some(p => String(p) === String(req.user._id))) {
    return next({ status: 403, message: "Not a participant" });
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: text?.trim() || "",
    mediaUrl,
    seenBy: [req.user._id],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "userName avatar");

  return res.status(201).json({ message: populatedMessage });
});

export const createGroup = asyncHandler(async (req, res, next) => {
  const { groupName, participantIds } = req.body;

  if (!groupName || !participantIds || participantIds.length < 2) {
    return next({ status: 400, message: "Group name and at least 2 members required" });
  }

  const allParticipants = [...new Set([...participantIds, req.user._id.toString()])];

  const conversation = await Conversation.create({
    participants: allParticipants,
    isGroup: true,
    groupName,
    admin: req.user._id,
  });

  const populated = await Conversation.findById(conversation._id)
    .populate("participants", "userName avatar");

  return res.status(201).json({ conversation: populated });
});

export const markAsSeen = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  await Message.updateMany(
    { conversation: conversationId, seenBy: { $ne: req.user._id } },
    { $addToSet: { seenBy: req.user._id } }
  );

  return res.status(200).json({ message: "Marked as seen" });
});