import express from "express";
import { googleauth, home, login, logout, register, user } from "../controllers/auth-controllers.js";
import validate from "../middlewares/validate-middleware.js";
import { loginSchema, signupSchema } from "../validation/validation.js";
import authMiddleware from "../middlewares/auth-middleware.js";
const router = express.Router();
router.route("/").get(home);
router.route("/register").post(validate(signupSchema), register);
router.route("/login").post(validate(loginSchema),login);
router.route("/google").post(googleauth);
router.route("/user").get(authMiddleware,user)
router.route("/logout").post(authMiddleware, logout);
export default router;
