// Example route file showing proper error handling patterns
// This is NOT part of your app - just for reference

import express from "express";
import asyncHandler from "../utils/asyncHandler.js";

const exampleRouter = express.Router();

// ============ PATTERN 1: Normal successful response ============
exampleRouter.get("/success", (req, res) => {
  console.log("✅ Normal route example");
  res.status(200).json({
    message: "Request successful",
    data: { example: "data" },
  });
});

// ============ PATTERN 2: Validation error (use next with error object) ============
exampleRouter.post("/validate", (req, res, next) => {
  console.log("Validating request...");
  
  const { email } = req.body;
  if (!email) {
    // Instead of res.json, use next() to route to error middleware
    return next({
      status: 400,
      message: "Validation failed",
      extraDetails: "Email field is required",
    });
  }
  
  res.status(200).json({ message: "Valid email", email });
});

// ============ PATTERN 3: Throw error synchronously ============
exampleRouter.get("/throw-sync", (req, res, next) => {
  console.log("Testing sync error...");
  
  // Wrapping in try-catch is good practice
  try {
    throw new Error("Something went wrong!");
  } catch (error) {
    // Pass to error middleware
    return next({
      status: 500,
      message: error.message,
      extraDetails: "An unexpected error occurred",
    });
  }
});

// ============ PATTERN 4: Throw error in async function ============
// Use asyncHandler wrapper to automatically catch errors
exampleRouter.get(
  "/throw-async",
  asyncHandler(async (req, res, next) => {
    console.log("Testing async error...");
    
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // This error is automatically caught and passed to error middleware
    throw new Error("Async operation failed!");
  })
);

// ============ PATTERN 5: Database error simulation ============
exampleRouter.get(
  "/database-error",
  asyncHandler(async (req, res, next) => {
    console.log("Simulating database error...");
    
    // In real scenario: const user = await User.findById(id);
    const user = null; // Simulating DB failure
    
    if (!user) {
      return next({
        status: 404,
        message: "User not found",
        extraDetails: "Invalid user ID",
      });
    }
    
    res.status(200).json({ user });
  })
);

// ============ PATTERN 6: Custom business logic error ============
exampleRouter.post(
  "/custom-error",
  asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    
    if (amount < 100) {
      return next({
        status: 422,
        message: "Invalid amount",
        extraDetails: "Amount must be at least 100",
      });
    }
    
    res.status(200).json({ message: "Payment processed", amount });
  })
);

export default exampleRouter;

// ============ CONSOLE OUTPUT EXAMPLES ============
/*
Success request:
[2026-06-01T12:34:56.123Z] GET /api/example/success - Status: 200 - 2ms

Validation error:
[ERROR] 2026-06-01T12:34:57.456Z - Status: 400
Message: Validation failed
Details: Email field is required
Method: POST /api/example/validate

Async error:
[ERROR] 2026-06-01T12:34:58.789Z - Status: 500
Message: Async operation failed!
Details: An unexpected error occurred
Stack: Error: Async operation failed!
    at exampleRouter.get (/path/to/routes.js:xx:xx)
    ...
*/
