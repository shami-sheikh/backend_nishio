import express from "express";
import { createReel, deleteReel, getAllReels, incrementReelView, toggleReelLike, toggleReelSave } from "../controllers/reel-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import upload from "../middlewares/upload-middleware.js";


const reelRouter = express.Router();

reelRouter.route("/allreels").get(getAllReels);
reelRouter.route("/createreels").post(authMiddleware, upload.single("video"), createReel);
reelRouter.route("/deletereel/:id").delete(authMiddleware, deleteReel);
reelRouter.route("/togglereel/:id/like").put(authMiddleware, toggleReelLike);
reelRouter.route("/increasereel/:id/view").put(authMiddleware, incrementReelView);
reelRouter.route("/togglereel/:id/save").put(authMiddleware, toggleReelSave)
export default reelRouter;