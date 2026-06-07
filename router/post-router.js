import express from "express";
import {
  createPost,
  getAllpost,
  getPost,
  deletePost,
  toggleLike,
  toggleSave,
} from "../controllers/post-controlers.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import upload from "../middlewares/upload-middleware.js";

const postRouter = express.Router();

postRouter.route("/getallpost").get(getAllpost);
postRouter.route("/createpost").post(authMiddleware, upload.single("media"), createPost); // "media" is the field name
postRouter.route("/getpost/:id").get(getPost);
postRouter.route("/deletepost/:id").delete(authMiddleware, deletePost);
postRouter.route("/togglelike/:id/like").put(authMiddleware, toggleLike);
postRouter.route("/togglesave/:id/save").put(authMiddleware, toggleSave);
export default postRouter;


