// Request Logger Middleware
// Logs every incoming request with method, URL, and response status

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Capture the original res.json to log when response is sent
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    const logColor = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m"; // Red for errors, green for success
    const resetColor = "\x1b[0m";

    console.log(
      `${logColor}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms${resetColor}`
    );

    // Call original json function
    return originalJson.call(this, data);
  };

  next();
};

export default loggerMiddleware;
