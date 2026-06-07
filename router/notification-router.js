import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification-controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.get("/unread", authMiddleware, getUnreadCount);
notificationRouter.put("/read-all", authMiddleware, markAllRead);
notificationRouter.put("/:id/read", authMiddleware, markOneRead);
notificationRouter.delete("/delete-all", authMiddleware, deleteAllNotifications);
notificationRouter.delete("/:id", authMiddleware, deleteNotification);

export default notificationRouter;