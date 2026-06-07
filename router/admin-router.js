import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
import {
  getStats,
  getAllUsers, deleteUser, toggleBan, toggleAdmin,
  getAllPosts, deletePost,
  getAllReels, deleteReel,
  getAllStories, deleteStory,
  getAllComments, deleteComment,
} from "../controllers/admin-controller.js";

const adminRouter = express.Router();

// Both middlewares on every route
adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/stats", getStats);
// --------------get all the user
adminRouter.get("/users", getAllUsers);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.put("/users/:id/ban", toggleBan);
adminRouter.put("/users/:id/admin", toggleAdmin);
// ----------get all the post 
adminRouter.get("/posts", getAllPosts);
adminRouter.delete("/posts/:id", deletePost);
// -------------get all the post----------
adminRouter.get("/reels", getAllReels);
adminRouter.delete("/reels/:id", deleteReel);
// -------------get all the story----------
adminRouter.get("/stories", getAllStories);
adminRouter.delete("/stories/:id", deleteStory);
// -------------get all the comments----------
adminRouter.get("/comments", getAllComments);
adminRouter.delete("/comments/:id", deleteComment);

export default adminRouter;