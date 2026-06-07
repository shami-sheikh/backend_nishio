import express from "express"
import { createStory, deleteStory, getAllStories, viewStory } from "../controllers/story-controller.js"
import authMiddleware from "../middlewares/auth-middleware.js"
import upload from "../middlewares/upload-middleware.js";
const storyRouter=express.Router();
storyRouter.route("/getallstory").get(authMiddleware,getAllStories)
storyRouter.route("/createstory").post(authMiddleware,upload.single("media"),createStory)
storyRouter.route("/viewstory/:id/view").put(authMiddleware, viewStory);
storyRouter.route("/deletestory/:id").delete(authMiddleware, deleteStory);
export default storyRouter;