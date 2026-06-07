import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import { generateCaption } from "../controllers/ai-controller.js";

const aiRouter = express.Router();

aiRouter.post("/caption", authMiddleware, generateCaption);

export default aiRouter;