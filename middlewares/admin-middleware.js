const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next({
      status: 403,
      message: "Forbidden",
      extraDetails: "Admin access required",
    });
  }
  next();
};

export default adminMiddleware;