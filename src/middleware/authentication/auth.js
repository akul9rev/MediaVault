import jwt from 'jsonwebtoken';
import authRepository from '../../repositories/auth.repository.js';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Authentication Guard Middleware (Strict)
 * Verifies Bearer tokens and attaches the authenticated user to the request context.
 * Rejects requests with missing, invalid, or expired tokens.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Verify Authorization header is present and carries a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication failed: Missing or invalid token format.', 401));
  }

  try {
    // 2. Verify token validity and expiration
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    const decoded = jwt.verify(token, secret);

    // 3. Fetch user details from database by ID parsed from JWT payload
    const userRow = await authRepository.findById(decoded.id);
    if (!userRow) {
      return next(new AppError('Authentication failed: The user owning this token no longer exists.', 401));
    }

    // 4. Instantiation and storage of User model in request context
    req.user = new User(userRow);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Authentication failed: Token has expired.', 401));
    }
    return next(new AppError('Authentication failed: Token is invalid.', 401));
  }
});

/**
 * Optional Authentication Guard Middleware
 * Attempts to parse Bearer tokens to extract user context.
 * If no token is provided, or the token is invalid, it silently passes request without rejecting it.
 */
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    const decoded = jwt.verify(token, secret);

    const userRow = await authRepository.findById(decoded.id);
    if (userRow) {
      req.user = new User(userRow);
    }
  } catch (error) {
    // Silently ignore verification failures to allow anonymous feed viewing
  }

  next();
});

export default protect;
