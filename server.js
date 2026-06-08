import "dotenv/config";
import express from "express";
import db from "./utils/db.js";
import router from "./router/auth-router.js"; 
import postRouter from "./router/post-router.js";
import loggerMiddleware from "./middlewares/logger-middleware.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import userRouter from "./router/user-router.js";
import reelRouter from "./router/reel-router.js";
import storyRouter from "./router/story-router.js";
import cors from "cors"
import commentRouter from "./router/comment-router.js";
import adminRouter from "./router/admin-router.js";
import notificationRouter from "./router/notification-router.js";
import aiRouter from "./router/ai-router.js";
import keepAlive from "./utils/keepAlive.js";
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nishiogram.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
// ============ MIDDLEWARES ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger - logs all incoming requests
app.use(loggerMiddleware);

// ============ ROUTES ============

app.use("/api/auth", router);
app.use("/api/posts", postRouter);
app.use("/api/users",userRouter)
app.use("/api/reels",reelRouter)
app.use("/api/story",storyRouter)
app.use("/api/comments", commentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.get("/", (req, res) => {
  return res.status(200).send("welcome to nishiogram");
});

// ============ 404 HANDLER ============
// Runs if no routes match
app.use((req, res, next) => {
  return next({
    status: 404,
    message: "Route not found",
    extraDetails: `No route matches ${req.method} ${req.originalUrl}`,
  });
});

// ============ GLOBAL ERROR HANDLER ============
// Must be LAST - catches all errors from routes and middlewares
app.use(errorMiddleware);

// ============ SERVER START ============
const port = process.env.PORT || 5000;

db()
  .then(() => {
    app.listen(port, () => {
      console.log(`\x1b[36mServer is running on port ${port}\x1b[0m`);
      keepAlive(); 
    });
  })
  .catch((error) => {
    console.error("Mongoose connection failed: ", error.message);
    process.exit(1);
  });