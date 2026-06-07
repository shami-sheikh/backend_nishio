import express from "express";
import {
  getComments,
  createComment,
  deleteComment,
  editComment,
  likeComment,
  addReply,
  deleteReply,
  likeReply,
} from "../controllers/comment-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const commentRouter = express.Router();

// ✅ Dynamic routes: /Post/postId or /Reel/reelId or /Story/storyId

// Get comments
commentRouter.route("/getcommet/:targetType/:targetId").get(getComments);

// Create comment
commentRouter.route("/createcomment/:targetType/:targetId").post(authMiddleware, createComment);

// Delete comment
commentRouter.route("/deletecomment/comment/:commentId").delete(authMiddleware, deleteComment);

// Edit comment
commentRouter.route("/comment/:commentId").put(authMiddleware, editComment);

// Like comment
commentRouter.route("/likecomment/comment/:commentId/like").put(authMiddleware, likeComment);

// Add reply
commentRouter.route("/replycomment/comment/:commentId/reply").post(authMiddleware, addReply);

// Delete reply
commentRouter.route("/deletereply/comment/:commentId/reply/:replyId").delete(authMiddleware, deleteReply);

// Like reply
commentRouter.route("/likereply/comment/:commentId/reply/:replyId/like").put(authMiddleware, likeReply);

export default commentRouter;