import { validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

/**
 * Validation Middleware Wrapper
 * Evaluates the express-validator results on the request object.
 * Throws a clean 400 Bad Request error if validation fails.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => `${err.path}: ${err.msg}`).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }
  next();
};

export default validate;
