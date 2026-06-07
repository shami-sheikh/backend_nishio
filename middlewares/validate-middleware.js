const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (err) {
    next({
      status: 422,
      message: "Validation failed",
      extraDetails: err.errors?.[0]?.message || err.message,
    });
  }
};

export default validate;