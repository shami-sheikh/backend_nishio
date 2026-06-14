import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import upload from "../middlewares/upload-middleware.js";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  createGroup,
  markAsSeen,
} from "../controllers/chat-controller.js";

const chatRouter = express.Router();

chatRouter.get("/conversations", authMiddleware, getMyConversations);
chatRouter.get("/conversations/:userId/start", authMiddleware, getOrCreateConversation);
chatRouter.post("/group", authMiddleware, createGroup);
chatRouter.get("/:conversationId/messages", authMiddleware, getMessages);
chatRouter.post("/:conversationId/messages", authMiddleware, upload.single("media"), sendMessage);
chatRouter.put("/:conversationId/seen", authMiddleware, markAsSeen);

export default chatRouter;