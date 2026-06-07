import express from "express"
import { getUserProfile, getAvatar, updateAvatar, updateProfile, toggleFollow, getAllUsers } from "../controllers/user-controller.js"
import authMiddleware from "../middlewares/auth-middleware.js"
import upload from "../middlewares/upload-middleware.js"

const userRouter = express.Router()
userRouter.route("/alluser").get(authMiddleware, getAllUsers);
userRouter.route("/profile").get(authMiddleware, getUserProfile);
userRouter.route("/profile/update").put(authMiddleware, updateProfile);
userRouter.route("/profile/avatar").get(authMiddleware, getAvatar).put(authMiddleware, upload.single("avatar"), updateAvatar);
userRouter.route("/:id/follow").put(authMiddleware, toggleFollow);

export default userRouter
