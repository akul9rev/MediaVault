/**
 * Async Handler Wrapper
 * Eliminates the need for repeating try/catch blocks in Express controllers.
 * Automatically catches async errors and forwards them to the next (error-handling) middleware.
 * 
 * @param {Function} fn - Async express route handler function
 * @returns {Function}
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
