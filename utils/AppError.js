// Custom Error Class
// Throw this anywhere, asyncHandler catches it automatically

class AppError extends Error {
  constructor(status, message, extraDetails = "Something went wrong") {
    super(message);
    this.status = status;
    this.extraDetails = extraDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
