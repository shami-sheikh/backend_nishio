// Global Error Handler Middleware
// Catches all errors and sends JSON responses with logging

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Backend error";
  const extraDetails = err.extraDetails || err.extradetails || "Something went wrong";

  // Log error to console in red
  console.error(
    `\x1b[31m[ERROR] ${new Date().toISOString()} - Status: ${status}\x1b[0m`
  );
  console.error(`\x1b[31mMessage: ${message}\x1b[0m`);
  console.error(`\x1b[31mDetails: ${extraDetails}\x1b[0m`);
  if (err.stack) {
    console.error(`\x1b[31mStack:\n${err.stack}\x1b[0m`);
  }
  console.error(`\x1b[31mMethod: ${req.method} ${req.originalUrl}\x1b[0m\n`);

  // Send error response to client
  return res.status(status).json({
    status,
    message,
    extraDetails,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Only show stack in development
  });
};

export default errorMiddleware;
