import walletService from '../services/wallet.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Wallet Controller
 * Manages request parameters and formatting JSON responses for balance checks and history.
 */
export const getWalletBalance = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const balance = await walletService.getWalletBalance(userId);

  res.status(200).json({
    status: 'success',
    wallet_balance: balance
  });
});

export const getTransactionHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const transactions = await walletService.getTransactionHistory(userId);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});
