import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication Controller
 * Directs HTTP requests to registration and session lifecycle operations.
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Delegate core registration to the service layer
  const user = await authService.register({ name, email, password });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      id: user.id.toString(),
      name: user.name,
      email: user.email
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Delegate credentials checking and token generation to service layer
  const { token, user } = await authService.login({ email, password });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      wallet_balance: user.wallet_balance
    }
  });
});

export const getMe = asyncHandler(async (req, res) => {
  // The 'protect' middleware guarantees req.user contains the authenticated User model
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: user.toJSON()
  });
});
