# Express Backend Logging & Error Handling Guide

## Overview

Your backend now has:
✅ **Request Logger** - logs all incoming requests  
✅ **Error Middleware** - catches and logs all errors  
✅ **404 Handler** - catches undefined routes  
✅ **Async Error Wrapper** - prevents unhandled rejections  
✅ **Colored Console Output** - easier to read  

---

## File Structure

```
backend/
├── server.js                           (main app setup)
├── middlewares/
│   ├── logger-middleware.js           (request logging)
│   ├── error-middleware.js            (error handling)
│   ├── auth-middleware.js
│   └── ... other middlewares
├── utils/
│   ├── asyncHandler.js                (async error wrapper)
│   ├── db.js
│   └── cloudinary.js
├── router/
│   ├── auth-router.js
│   ├── post-router.js
│   └── example-routes.js              (reference patterns)
└── ...
```

---

## How It Works

### 1. Request Logger Middleware

```javascript
// Logs every request with method, URL, and status
app.use(loggerMiddleware);

// Console output:
// [2026-06-01T12:34:56.123Z] GET /api/posts - Status: 200 - 45ms
// [2026-06-01T12:34:57.456Z] POST /api/posts - Status: 400 - 12ms (red = error)
```

### 2. Routes → Error Handling Flow

```
Request comes in
    ↓
Logger middleware (logs it)
    ↓
Your route handler
    ↓
    ├─ Success? → Send response (logger catches it)
    │
    ├─ Error? → next({ status, message, extraDetails })
    │
    └─ Uncaught error? → catch block → next(error)
         ↓
    Error Middleware (catches ALL errors)
         ↓
    Logs error details in red
    Sends JSON response to client
```

### 3. Error Middleware Console Output

**For validation error (400):**
```
[ERROR] 2026-06-01T12:34:57.456Z - Status: 400
Message: Validation failed
Details: Email field is required
Method: POST /api/auth/register
```

**For server error (500):**
```
[ERROR] 2026-06-01T12:34:58.789Z - Status: 500
Message: Async operation failed!
Details: An unexpected error occurred
Stack: Error: Async operation failed!
    at exampleRouter.get (/path/to/routes.js:45:12)
    at Layer.handle [as handle_request] (...)
    ...
Method: GET /api/posts
```

---

## Usage Patterns

### Pattern 1: Validation Error (use `next()`)

```javascript
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next({
      status: 400,
      message: "All fields are required",
      extraDetails: "Email and password are required",
    });
  }
  
  res.status(200).json({ message: "Login successful" });
};
```

**Console:** Shows error in red with details.

---

### Pattern 2: Async Error (use `asyncHandler` wrapper)

```javascript
import asyncHandler from "../utils/asyncHandler.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const post = await Post.create(req.body);
  // If Post.create() throws, asyncHandler catches it automatically
  
  res.status(201).json({ message: "Post created", post });
});
```

**In router:**
```javascript
postRouter.post("/", authMiddleware, upload.single("media"), createPost);
```

---

### Pattern 3: Try-Catch (for complex logic)

```javascript
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return next({
        status: 404,
        message: "Post not found",
        extraDetails: "Invalid post ID",
      });
    }
    
    // Other logic...
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
    
  } catch (error) {
    next(error); // Passes to error middleware
  }
};
```

---

### Pattern 4: Normal Success Response

```javascript
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    res.status(200).json({
      message: "Post fetched",
      post,
    });
    
  } catch (error) {
    next(error);
  }
};
```

---

## Why Malformed Postman Requests Don't Appear in Console

Your backend **only logs requests it receives**. Here's why you see nothing:

### 1. **Malformed JSON Body**
```
❌ Request never leaves Postman:
{
  "email": "test@example.com"
  "password": "123"  ← missing comma
}
```
**Postman error:** "Invalid JSON" ← Postman catches this BEFORE sending

**Your backend:** Never sees the request

---

### 2. **Wrong Content-Type**
```
Body: Raw JSON
Content-Type: application/xml  ← mismatch
```

**Your server:** Express parses with `express.json()` but gets XML syntax  
**Result:** `req.body` is empty or malformed  
**Fix:** Set Content-Type to `application/json` in Postman

---

### 3. **Wrong Body Format for File Upload**
```
❌ Sending raw JSON:
{
  "media": "file",
  "caption": "text"
}
```

**Your route:** Expects `form-data` with `upload.single("media")`  
**Result:** `req.file` is undefined, but request still reaches your code  
**Console output:** Shows the request, then POST handler returns "Media required"

**Fix:** Use Postman Body → `form-data` (not Raw JSON)

---

### 4. **Network Issues**
```
❌ Wrong URL: http://localhost:5001 (server runs on 5000)
❌ Server not running
❌ Firewall blocking request
```

**Your backend:** Never receives the request  
**Postman:** Shows connection error before reaching server

---

### 5. **Missing Authorization Header**
```
Authorization: Bearer abc123
```

Your `authMiddleware` checks for this:
```javascript
if (!token) {
  return next({
    status: 401,
    message: "Unauthorized",
    extraDetails: "No token provided",
  });
}
```

**Console output:**
```
[2026-06-01T12:34:57.123Z] POST /api/posts - Status: 401 - 2ms

[ERROR] 2026-06-01T12:34:57.125Z - Status: 401
Message: Unauthorized
Details: No token provided
```

---

## Console Output Colors

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 Green | Success (2xx/3xx) | `GET /api/posts - Status: 200` |
| 🔴 Red | Error (4xx/5xx) | Error middleware output |
| 🔵 Blue | Server startup | `Server is running on port 5000` |

---

## How to Test Each Pattern

### Test 1: Success
```bash
curl http://localhost:5000/
# Console: [2026-06-01T...] GET / - Status: 200 - Xms
```

### Test 2: 404 (undefined route)
```bash
curl http://localhost:5000/api/undefined
# Console shows 404 error in red
```

### Test 3: Validation Error
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
# Missing password → error middleware logs it
```

### Test 4: With asyncHandler
```bash
# Any async route wrapped with asyncHandler
# If it throws, error middleware catches and logs it
```

---

## Best Practices

1. **Always use `next(error)` or `next({status, message, extraDetails})`** for errors
2. **Use `asyncHandler` wrapper** for all async route handlers
3. **Include try-catch** for database operations
4. **Set correct Content-Type** in Postman (application/json or form-data)
5. **Check Authorization header** is being sent
6. **Monitor console** for errors in red

---

## Summary

Your backend now:
- ✅ Logs every request that reaches it
- ✅ Logs errors in detail (status, message, stack)
- ✅ Returns consistent JSON error format
- ✅ Handles async errors automatically
- ✅ Shows 404 for undefined routes
- ✅ Uses colored output for easy debugging

**Nothing in console = request never left Postman or reached network**
