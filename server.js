import "dotenv/config";
import express from "express";
import http from "http"; // ✅ add this
import { initSocket } from "./utils/socket.js"; // ✅ add this
import db from "./utils/db.js";
import router from "./router/auth-router.js";
import postRouter from "./router/post-router.js";
import loggerMiddleware from "./middlewares/logger-middleware.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import userRouter from "./router/user-router.js";
import reelRouter from "./router/reel-router.js";
import storyRouter from "./router/story-router.js";
import cors from "cors";
import commentRouter from "./router/comment-router.js";
import adminRouter from "./router/admin-router.js";
import notificationRouter from "./router/notification-router.js";
import aiRouter from "./router/ai-router.js";
import chatRouter from "./router/chat-router.js"; 
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use("/api/auth", router);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/reels", reelRouter);
app.use("/api/story", storyRouter);
app.use("/api/comments", commentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/chat", chatRouter); // ✅ add this

app.get("/", (req, res) => {
  return res.status(200).send("welcome to nishiogram");
});

app.use((req, res, next) => {
  return next({
    status: 404,
    message: "Route not found",
    extraDetails: `No route matches ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

// ✅ create http server and attach socket.io
const server = http.createServer(app);
initSocket(server);

db()
  .then(() => {
    server.listen(port, () => { 
      console.log(`\x1b[36mServer is running on port ${port}\x1b[0m`);
      keepAlive();
    });
  })
  .catch((error) => {
    console.error("Mongoose connection failed: ", error.message);
    process.exit(1);
  });