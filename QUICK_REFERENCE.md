# Quick Reference: Error Handling Patterns

## For Your Routes (Copy-Paste Templates)

### 1️⃣ Simple Success Route
```javascript
export const myRoute = async (req, res, next) => {
  try {
    // Your code here
    res.status(200).json({ message: "Success", data: {} });
  } catch (error) {
    next(error);
  }
};
```

### 2️⃣ Validation Error (Missing Field)
```javascript
return next({
  status: 400,
  message: "Validation failed",
  extraDetails: "Email is required",
});
```

### 3️⃣ Not Found Error
```javascript
const user = await User.findById(id);
if (!user) {
  return next({
    status: 404,
    message: "User not found",
    extraDetails: "Invalid user ID",
  });
}
```

### 4️⃣ Permission Error
```javascript
if (post.user.toString() !== req.user._id.toString()) {
  return next({
    status: 403,
    message: "Forbidden",
    extraDetails: "You cannot delete this post",
  });
}
```

### 5️⃣ Using asyncHandler (Easiest for Async)
```javascript
import asyncHandler from "../utils/asyncHandler.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const post = await Post.create(req.body);
  res.status(201).json({ message: "Created", post });
  // Errors are caught automatically!
});
```

---

## Console Output You'll See

### ✅ Success (Green)
```
[2026-06-01T12:34:56.123Z] POST /api/posts - Status: 201 - 45ms
```

### ❌ Error (Red)
```
[ERROR] 2026-06-01T12:34:57.456Z - Status: 400
Message: Validation failed
Details: Email is required
Method: POST /api/auth/register
```

---

## Postman Setup Checklist

- [ ] Method: `POST` / `GET` / etc.
- [ ] URL: `http://localhost:5000/api/...`
- [ ] Authorization: Bearer token (if needed)
- [ ] Body type:
  - JSON endpoints: `raw` + `application/json`
  - File upload: `form-data`
- [ ] Field names match backend (e.g., `media`, `caption`)

---

## Debugging Checklist

| Issue | Check |
|-------|-------|
| No error in console | Postman error = request never sent |
| 400 error | Check Content-Type and field names |
| 401 Unauthorized | Add Authorization header with token |
| 404 Not Found | Check URL spelling |
| 500 Server Error | Check console for stack trace |

---

## Remember

1. **Use `next()` for errors** - don't use `res.json()`
2. **Use `asyncHandler` wrapper** - for all async routes
3. **Always check console** - in red for errors, green for success
4. **Postman issues** - appear in Postman UI, NOT in your console
