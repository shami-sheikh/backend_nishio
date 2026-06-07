// Async Handler Wrapper
// Catches errors thrown in async route handlers automatically
// This prevents "unhandled promise rejection" warnings

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
