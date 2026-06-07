import User from "../models/user-models.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";

export const home = (req, res) => {
  res.status(200).json({ message: "Home route is working fine" });
};

export const register = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  
  if (!userName || !email || !password) {
    return next({
      status: 400,
      message: "All fields are required",
      extraDetails: "userName, email, and password are required",
    });
  }
  
  const userExits = await User.findOne({ email });
  if (userExits) {
    return next({
      status: 409,
      message: "Email already registered",
      extraDetails: "This email is already in use",
    });
  }
  
  const isAdmin = email === process.env.SUPER_ADMIN_EMAIL;
  const hash_password = await bcrypt.hash(password, 10);
  const NewUser = await User.create({
    userName,
    email,
    password: hash_password,
    isAdmin,
  });
  // console.log(NewUser);
  
  return res.status(201).json({
    message: "Registration successful",
    user: {
      userName: NewUser.userName,
      email: NewUser.email,
      token: await NewUser.generateToken(),
      userId: NewUser._id.toString(),
       isAdmin: NewUser.isAdmin,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next({
      status: 400,
      message: "All fields are required",
      extraDetails: "Email and password are required",
    });
  }
  
  const userExits = await User.findOne({ email });
  if (!userExits) {
    return next({
      status: 404,
      message: "User not found",
      extraDetails: "Pahle account signup to kar chutiye fir login karna email not found ",
    });
  }
  
  const isPasswordValid = await userExits.comparePassword(password);
  // console.log(isPasswordValid);
  
  if (isPasswordValid) {
    return res.status(200).json({
      message: "Login successful",
      user: {
        email: userExits.email,
        userName: userExits.userName,
        token: await userExits.generateToken(),
        userId: userExits._id.toString(),
          isAdmin: userExits.isAdmin,
      },
    });
  } else {
    return next({
      status: 401,
      message: "Invalid credentials",
      extraDetails: "Email or password is incorrect",
    });
  }
});

export const user = asyncHandler(async (req, res, next) => {
  const userData = req.user;
  return res.status(200).json({
    message: "User fetched",
    user: userData,
  });
});
export const logout = asyncHandler(async (req, res, next) => {
  return res.status(200).json({ message: "Logged out successfully" });
});