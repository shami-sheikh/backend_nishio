import jwt from "jsonwebtoken";
import User from "../models/user-models.js";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next({
      status: 401,
      message: "Unauthorized",
      extraDetails: "No token provided",
    });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(userId).select("-password");
    if (!req.user) return next({ status: 401, message: "Unauthorized" });
    if (req.user.isBanned) {
      return next({ status: 403, message: "Your account has been banned" });
    }
    if (!req.user) {
      return next({
        status: 401,
        message: "Unauthorized",
        extraDetails: "User not found",
      });
    }

    next();
  } catch (error) {
    return next({
      status: 401,
      message: "Unauthorized",
      extraDetails: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
