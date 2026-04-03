const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';

  if (statusCode === 500 && process.env.NODE_ENV !== 'development') {
    message = 'An unexpected error occurred. Please try again or contact support.';
  }

  const errors = err.errors || [];

  return errorResponse(res, message, errors, statusCode);
};

module.exports = errorHandler;
