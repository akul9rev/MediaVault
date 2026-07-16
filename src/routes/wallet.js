import { Router } from 'express';
import { getWalletBalance, getTransactionHistory } from '../controllers/wallet.controller.js';
import protect from '../middleware/authentication/auth.js';

const router = Router();

// Protect all wallet endpoints
router.use(protect);

// Endpoint paths matching GET /api/v1/wallet and GET /api/v1/wallet/transactions
router.get('/', getWalletBalance);
router.get('/transactions', getTransactionHistory);

export default router;
