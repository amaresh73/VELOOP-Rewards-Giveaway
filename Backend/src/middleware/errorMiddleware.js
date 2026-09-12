export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Unable to complete this request right now.';

  res.status(statusCode).json({
    success: false,
    code: err.code || 'INTERNAL_ERROR',
    message
  });
};
