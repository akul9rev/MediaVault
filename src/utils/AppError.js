/**
 * Custom Operational Error Class
 * Used to handle expected validation, authorization, and transactional failures.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for operational error tracking

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
